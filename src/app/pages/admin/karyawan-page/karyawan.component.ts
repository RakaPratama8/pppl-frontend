import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KaryawanService, KaryawanDTO } from '../../../service/karyawan.service';
import { ManagerService, ManagerDTO } from '../../../service/manager.service';
import { ToastService } from '../../../service/toast.service';

interface KaryawanStatistics {
  total: number;
}

@Component({
  selector: 'app-karyawan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './karyawan.component.html',
  styleUrls: ['./karyawan.component.scss']
})
export class KaryawanComponent implements OnInit {
  // Data
  karyawan: KaryawanDTO[] = [];
  filteredKaryawan: KaryawanDTO[] = [];
  managers: ManagerDTO[] = [];
  statistics: KaryawanStatistics = { total: 0 };

  // UI State
  loading = false;
  processing = false;
  showModal = false;
  isEditMode = false;

  // Dropdown States
  dropdownStates: { [key: string]: boolean } = {
  manager: false
  };

  // Filters
  searchKeyword = '';
  selectedManager: number | null = null;

  // Form Data
  formData: KaryawanDTO = {
    namaKaryawan: '',
    emailKaryawan: '',
    noTelp: '',
    jabatanPosisi: '',
    idManager: 0
  };

  constructor(
    private karyawanService: KaryawanService,
    private managerService: ManagerService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadManagers();
    this.loadKaryawan();
  }

  // Data loading

  loadManagers() {
    this.managerService.getAllManagers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.managers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading managers:', error);
      }
    });
  }

  loadKaryawan() {
    this.loading = true;
    this.karyawanService.getAllKaryawan().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.karyawan = response.data;
          this.updateStatistics();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading karyawan:', error);
        this.showError('Gagal memuat data karyawan');
        this.loading = false;
      }
    });
  }

  updateStatistics() {
    this.statistics.total = this.karyawan.length;
  }

  // Filtering

  selectManager(idManager: number | null) {
    this.selectedManager = idManager;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.karyawan];

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(k =>
        k.namaKaryawan.toLowerCase().includes(keyword) ||
        k.emailKaryawan.toLowerCase().includes(keyword) ||
        k.jabatanPosisi.toLowerCase().includes(keyword) ||
        k.namaManager?.toLowerCase().includes(keyword)
      );
    }

    // Filter by manager
    if (this.selectedManager !== null) {
      result = result.filter(k => k.idManager === this.selectedManager);
    }

    this.filteredKaryawan = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedManager = null;
    this.applyFilters();
  }

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectDropdownItem(dropdown: string, value: any) {
    if (dropdown === 'status') {
      this.formData.idManager = value;
    }
    this.dropdownStates[dropdown] = false;
  }

  getSelectedLabel(dropdown: string): string {
    if (dropdown === 'manager') {
      const manager = this.managers.find(m => m.idManager === this.formData.idManager);
      return manager?.namaManager || 'Pilih Manager';
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  // Modal handling

  openCreateModal() {
    this.isEditMode = false;
    this.formData = {
      namaKaryawan: '',
      emailKaryawan: '',
      noTelp: '',
      jabatanPosisi: '',
      idManager: 0
    };
    this.showModal = true;
  }

  openEditModal(karyawan: KaryawanDTO) {
    this.isEditMode = true;
    this.formData = { ...karyawan };
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.formData = {
      namaKaryawan: '',
      emailKaryawan: '',
      noTelp: '',
      jabatanPosisi: '',
      idManager: 0
    };
  }

  // Form

  isFormValid(): boolean {
    return !!(
      this.formData.namaKaryawan.trim() &&
      this.formData.emailKaryawan.trim() &&
      this.formData.noTelp.trim() &&
      this.formData.jabatanPosisi.trim() &&
      this.formData.idManager
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.warning('Warning', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    const action = this.isEditMode
      ? this.karyawanService.updateKaryawan(this.formData.idKaryawan!, this.formData)
      : this.karyawanService.createKaryawan(this.formData);

    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', response.message || 'Data karyawan berhasil disimpan');
          this.closeModal();
          this.loadKaryawan();
        } else {
          this.toast.error('Error!', response.message || 'Gagal menyimpan data');
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menyimpan data karyawan');
        this.processing = false;
      }
    });
  }

  // Delete
  deleteKaryawan(karyawan: KaryawanDTO) {
    if (!karyawan.idKaryawan) return;

    this.toast.confirm(
      `Hapus karyawan "${karyawan.namaKaryawan}"?`,
      'Tindakan ini tidak dapat dibatalkan'
    ).then(result => {
      if (!result) return;

      this.processing = true;
      this.karyawanService.deleteKaryawan(karyawan.idKaryawan!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('succces!', 'Karyawan berhasil dihapus');
            this.loadKaryawan();
          } else {
            this.toast.error('Error!', res.message);
          }
          this.processing = false;
        },
        error: () => {
          this.toast.error('Error!', 'Gagal menghapus karyawan');
          this.processing = false;
        }
      });
    });
  }

  // Error handling
  private handleError(error: any, defaultMessage: string) {
    const errorMessage = error.error?.message || error.message || defaultMessage;
    this.toast.error('Error! ', errorMessage);
  }

  private showError(message: string) {
    this.toast.error('Error! ', message);
  }

  // Refresh data
  refreshData() {
    this.loadKaryawan();
  }
}