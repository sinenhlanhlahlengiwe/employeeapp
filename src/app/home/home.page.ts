import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { Employee } from '../interfaces/employee';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonItemSliding, IonAvatar,
  IonIcon, IonButtons, IonButton, IonItemOptions, IonItemOption,
  IonLoading, IonFab, IonFabButton, IonNote
} from '@ionic/angular/standalone';
import { addOutline, personCircleOutline, createOutline, 
         trashOutline, refreshOutline, chevronForward } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle,
    IonContent, IonSearchbar, IonList, IonItem, IonLabel,
    IonItemSliding, IonAvatar, IonIcon, IonButtons, IonButton,
    IonItemOptions, IonItemOption, IonLoading, IonFab,
    IonFabButton, IonNote
  ]
})
export class HomePage implements OnInit, OnDestroy {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  isLoading = false;
  appName = environment.appName;
  maxSearchResults = environment.maxSearchResults;
  minSearchLength = environment.minSearchLength;
  private employeesSubscription?: Subscription;

  constructor(
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.initializeIcons();
  }

  private initializeIcons(): void {
    addIcons({
      refreshOutline,
      personCircleOutline,
      chevronForward,
      createOutline,
      trashOutline,
      addOutline
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.employeesSubscription?.unsubscribe();
  }

  async refreshEmployees(): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadEmployees();
      await this.showToast('Employees refreshed successfully');
    } catch (error) {
      await this.showError('Failed to refresh employees');
    } finally {
      this.isLoading = false;
    }
  }

  private loadEmployees(): void {
    this.isLoading = true;
    this.employeesSubscription = this.dataService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = [...employees];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.showError(error.message || 'Failed to load employees');
        this.isLoading = false;
        this.resetEmployeeLists();
      }
    });
  }

  handleSearch(event: CustomEvent): void {
    const query = (event.target as HTMLIonSearchbarElement).value?.toLowerCase() || '';
    
    if (query.length < this.minSearchLength) {
      this.resetSearch();
      return;
    }

    this.filterEmployees(query);
  }

  private filterEmployees(query: string): void {
    this.filteredEmployees = this.employees
      .filter(emp => this.employeeMatchesSearch(emp, query))
      .slice(0, this.maxSearchResults);
  }

  private employeeMatchesSearch(emp: Employee, query: string): boolean {
    return [
      emp.name,
      emp.department,
      emp.position,
      emp.email
    ].some(field => field?.toLowerCase().includes(query));
  }

  async deleteEmployee(id: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this employee?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.handleDelete(id)
        }
      ]
    });
    await alert.present();
  }

  private async handleDelete(id: number): Promise<void> {
    this.isLoading = true;
    try {
      await this.dataService.deleteEmployee(id);
      await this.loadEmployees();
      await this.showToast('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      await this.showError('Failed to delete employee');
    } finally {
      this.isLoading = false;
    }
  }

  trackByFn(index: number, employee: Employee): number {
    return employee.id;
  }

  private resetEmployeeLists(): void {
    this.employees = [];
    this.filteredEmployees = [];
  }

  private resetSearch(): void {
    this.filteredEmployees = [...this.employees];
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}