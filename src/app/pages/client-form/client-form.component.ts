import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ClientFormService, ClientFormDTO } from '../../service/client-form.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
  animations: [
    trigger('navbarSlide', [
      state('hidden', style({
        transform: 'translateY(-150%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ])
  ]
})
export class ClientFormComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  
  // Form Data
  formData: ClientFormDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    topic: '',
    message: '',
    perusahaan: '',
    anggaran: '',
    waktuImplementasi: ''
  };

  // Form validation errors
  formErrors = {
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    topic: false,
    message: false
  };

  // Dropdown Options
  kategoriLayananOptions = [
    'Sosial',
    'Perangkat lunak',
    'Multimedia',
    'Keamanan sistem'
  ];
  
  anggaranOptions = [
    'Kurang dari 20 Juta',
    'Antara 20 - 50 Juta',
    'Lebih dari 50 Juta',
    'Belum tahu'
  ];
  
  waktuOptions = [
    'Kurang dari 1 bulan',
    'Antara 1 - 3 Bulan',
    'Lebih dari 3 Bulan',
    'Fleksibel'
  ];

  // UI States
  submitting = false;
  submitted = false;

  constructor(
    private clientFormService: ClientFormService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialization if needed
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (Math.abs(scrollTop - this.lastScrollTop) > 100) {
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarVisible = false;
      } else {
        this.navbarVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
  }

  scrollToSection(sectionId: string) {
    if (sectionId === 'hero') {
      this.router.navigate(['/']);
      return;
    }

    // Navigate to landing page with fragment
    this.router.navigate(['/'], { fragment: sectionId });
  }

  validateForm(): boolean {
    // Reset errors
    this.formErrors = {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      topic: false,
      message: false
    };

    let isValid = true;

    // Check required fields
    if (!this.formData.firstName.trim()) {
      this.formErrors.firstName = true;
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.formErrors.lastName = true;
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.formErrors.email = true;
      isValid = false;
    } else if (!this.validateEmail(this.formData.email)) {
      this.formErrors.email = true;
      isValid = false;
    }

    if (!this.formData.phoneNumber.trim()) {
      this.formErrors.phoneNumber = true;
      isValid = false;
    }

    if (!this.formData.topic) {
      this.formErrors.topic = true;
      isValid = false;
    }

    if (!this.formData.message.trim()) {
      this.formErrors.message = true;
      isValid = false;
    }

    return isValid;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  onSubmit() {
    if (!this.validateForm()) {
      alert('⚠️ Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    this.submitting = true;

    this.clientFormService.submitForm(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.submitted = true;
          this.resetForm();
          
          // Auto hide success message after 5 seconds
          setTimeout(() => {
            this.submitted = false;
          }, 5000);
        } else {
          alert('Gagal mengirim form: ' + response.message);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        alert('Gagal mengirim form: ' + (error.error?.message || 'Terjadi kesalahan pada server'));
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      topic: '',
      message: '',
      perusahaan: '',
      anggaran: '',
      waktuImplementasi: ''
    };
  }
}