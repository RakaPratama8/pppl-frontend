import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadScoringService, LeadAnalysisDTO, LeadStatistics } from '../../../service/lead-scoring.service';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-lead-scoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-scoring.component.html',
  styleUrls: ['./lead-scoring.component.scss']
})
export class LeadScoringComponent implements OnInit {
  loading = false;
  analyzing = false;
  leads: LeadAnalysisDTO[] = [];
  filteredLeads: LeadAnalysisDTO[] = [];
  statistics: LeadStatistics = {
    totalLeads: 0,
    analyzedLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0
  };

  selectedFilter: string = 'ALL';
  selectedLead: LeadAnalysisDTO | null = null;
  showDetailModal = false;
  analyzingLeads = new Set<number>();

  constructor(
    private leadScoringService: LeadScoringService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadLeadResults();
  }

  loadStatistics() {
    this.leadScoringService.getLeadStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.toastService.error('Gagal Memuat Data', 'Tidak dapat memuat statistik leads');
      }
    });
  }

  loadLeadResults() {
    this.loading = true;
    this.leadScoringService.getAllLeads().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leads = response.data;
          this.applyFilter(this.selectedFilter);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leads:', error);
        this.toastService.error('Gagal Memuat Data', 'Tidak dapat memuat data leads dari server');
        this.loading = false;
      }
    });
  }

  /**
   * Analisa single lead dengan konfirmasi Toast
   */
  async analyzeLead(idRequest: number) {
    const lead = this.leads.find(l => l.idRequest === idRequest);
    const leadInfo = lead ? `${lead.namaKlien} (${lead.layanan})` : `#${idRequest}`;
    
    // Konfirmasi dengan toast-style
    const confirmed = await this.toastService.helpConfirm(
      'Analisa lead ini dengan AI?',
      `${leadInfo}\n`
    );

    if (confirmed) {
      this.analyzingLeads.add(idRequest);
      this.analyzing = true;
      
      this.leadScoringService.analyzeLeadById(idRequest).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            
            // Show success toast dengan detail
            this.toastService.success(
              'Lead Berhasil Dianalisa!',
              `<strong>${data.skorPrioritas}</strong> - ${data.kategori}<br>` +
              `<small>Confidence: ${data.confidence}%</small><br>`
            );
            
            // Reload data
            this.loadLeadResults();
            this.loadStatistics();
          }
          this.analyzingLeads.delete(idRequest);
          this.analyzing = false;
        },
        error: (error) => {
          this.analyzingLeads.delete(idRequest);
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  /**
   * Analisa semua lead yang belum dianalisa
   */
  async analyzeAll() {
    const unanalyzed = this.leads.filter(l => !l.aiAnalyzed);
    
    if (unanalyzed.length === 0) {
      this.toastService.success(
        'Semua lead sudah dianalisa',
        'Tidak ada lead yang perlu dianalisa.'
      );
      return;
    }

    const estimatedTime = Math.ceil(unanalyzed.length / 15) * 2;
    
    const confirmed = await this.toastService.helpConfirm(
      'Analisa Semua Lead?',
      `Sistem akan menganalisa ${unanalyzed.length} lead yang belum dianalisa.\n\n` +
      `Estimasi waktu: ~${estimatedTime} menit\n\n` +
      `Lanjutkan?`
    );

    if (confirmed) {
      this.analyzing = true;
      
      // Show processing toast
      this.toastService.help(
        'Memproses Batch Analysis...',
        `Menganalisa ${unanalyzed.length} leads. Mohon tunggu...`
      );
      
      this.leadScoringService.analyzeAllPendingLeads().subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success(
              'Batch Analysis Selesai!',
              response.message || `Berhasil menganalisa ${unanalyzed.length} leads`
            );
            this.loadLeadResults();
            this.loadStatistics();
          }
          this.analyzing = false;
        },
        error: (error) => {
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  /**
   * Apply filter untuk leads
   */
  applyFilter(filter: string) {
    this.selectedFilter = filter;
    
    switch (filter) {
      case 'ALL':
        this.filteredLeads = this.leads;
        break;
      case 'UNANALYZED':
        this.filteredLeads = this.leads.filter(l => !l.aiAnalyzed);
        break;
      case 'HOT':
      case 'WARM':
      case 'COLD':
        this.filteredLeads = this.leads.filter(l => l.skorPrioritas === filter);
        break;
      default:
        this.filteredLeads = this.leads;
    }
  }

  /**
   * Get priority CSS class
   */
  getPriorityClass(priority: string | null): string {
    if (!priority) return 'priority-none';
    return `priority-${priority.toLowerCase()}`;
  }

  /**
   * Show lead detail modal
   */
  showDetail(lead: LeadAnalysisDTO) {
    this.selectedLead = lead;
    this.showDetailModal = true;
  }

  /**
   * Close modal
   */
  closeModal() {
    this.showDetailModal = false;
    this.selectedLead = null;
  }

  /**
   * Format date
   */
  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if lead sedang dianalisa
   */
  isAnalyzing(idRequest: number): boolean {
    return this.analyzingLeads.has(idRequest);
  }

  // ========== ERROR HANDLING ==========

  /**
   * Handle analysis error dengan Toast
   */
  private handleAnalysisError(error: any) {
    console.error('Analysis error:', error);
    
    const errorMessage = error.error?.message || error.message || 'Terjadi kesalahan saat menganalisa';
    
    // Handle rate limit error
    if (errorMessage.includes('Rate limit')) {
      const retryAfter = this.extractRetryAfter(errorMessage);
      this.toastService.warning(
        'Rate Limit Exceeded! ⏱️',
        `${errorMessage}<br><br>Silakan tunggu <strong>${retryAfter} detik</strong> dan coba lagi.`
      );
    } else if (errorMessage.includes('tidak ditemukan')) {
      this.toastService.error(
        'Lead Tidak Ditemukan',
        errorMessage
      );
    } else if (errorMessage.includes('Gemini API')) {
      this.toastService.error(
        'AI Service Error',
        `${errorMessage}<br><br>Silakan coba lagi nanti.`
      );
    } else {
      this.toastService.error(
        'Gagal Menganalisa Lead',
        errorMessage
      );
    }
  }

  /**
   * Extract retry after seconds
   */
  private extractRetryAfter(message: string): string {
    const match = message.match(/(\d+)\s*detik/);
    return match ? match[1] : 'beberapa';
  }

  /**
   * Refresh data
   */
  refreshData() {
    this.loadStatistics();
    this.loadLeadResults();
  }
}