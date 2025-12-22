import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface NotificationDTO {
  idNotification?: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class BellService implements OnDestroy {

  private apiUrl = `${environment.apiUrl}/admin/notifications`;
  private wsUrl = `${environment.apiUrl}/ws`;

  private stompClient!: Client;

  // Single source of truth
  private notificationsSubject =
    new BehaviorSubject<NotificationDTO[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialNotifications();
    this.initWebSocket();
  }

  /**
   * Initial Load Notifications
   */
  private loadInitialNotifications(): void {
    this.http
      .get<ApiResponse<NotificationDTO[]>>(`${this.apiUrl}/recent`)
      .subscribe(res => {
        if (res.success && res.data) {
          this.notificationsSubject.next(res.data);
        }
      });
  }

  /**
   * WebSocket Initialization
   */
  private initWebSocket(): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/notifications', (msg: IMessage) => {
        const notif: NotificationDTO = JSON.parse(msg.body);

        const current = this.notificationsSubject.value;

        // prepend + limit
        this.notificationsSubject.next([
          notif,
          ...current.filter(n => n.idNotification !== notif.idNotification)
        ].slice(0, 10));
      });
    };

    this.stompClient.activate();
  }

  /**
   * State mutations
   */
  markAsRead(id: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }

  updateLocalAsRead(id: number) {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n =>
        n.idNotification === id ? { ...n, isRead: true } : n
      )
    );
  }

  updateLocalAllRead() {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n => ({ ...n, isRead: true }))
    );
  }

  removeLocal(id: number) {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter(n => n.idNotification !== id)
    );
  }

  ngOnDestroy(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }
}
