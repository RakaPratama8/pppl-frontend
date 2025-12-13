import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon?: string;
}

@Component({
  selector: 'app-who-we-are',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './who-we-are.component.html',
  styleUrls: ['./who-we-are.component.scss'],
  animations: [
    trigger('navbarSlide', [
      state('hidden', style({
        transform: 'translateY(-100%)',
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
export class WhoWeAreComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  // Hero section properties for better maintainability
  heroTitle = 'Who We Are';
  heroSubtitle = 'Innovating digital solutions for a better tomorrow';

  timelineItems: TimelineItem[] = [
    {
      date: '2010',
      title: 'Company Founded',
      description: 'Pandigi was established with a vision to innovate in digital solutions.',
      icon: '🏢'
    },
    {
      date: '2012',
      title: 'First Major Project',
      description: 'Launched our flagship software product, revolutionizing the industry.',
      icon: '🚀'
    },
    {
      date: '2015',
      title: 'Expansion',
      description: 'Opened new offices and expanded our team to serve global clients.',
      icon: '🌍'
    },
    {
      date: '2018',
      title: 'Award Recognition',
      description: 'Received industry awards for excellence in technology and innovation.',
      icon: '🏆'
    },
    {
      date: '2021',
      title: 'Digital Transformation',
      description: 'Embraced cutting-edge technologies to enhance our services.',
      icon: '💡'
    },
    {
      date: '2023',
      title: 'Sustainability Initiative',
      description: 'Committed to eco-friendly practices and sustainable development.',
      icon: '🌱'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - this.lastScrollTop) > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarVisible = false;
      } else {
        this.navbarVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
  }

  scrollToSection(sectionId: string): void {
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('Element found, scrolling to:', sectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('Element not found for section:', sectionId);
    }
  }

  redirectToPage(page: string): void {
    console.log('Redirecting to page:', page);
    this.router.navigate([`/${page}`]);
  }
}
