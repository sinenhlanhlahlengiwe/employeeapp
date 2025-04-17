import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Employee } from '../interfaces/employee';
import { AlertController, ToastController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonInput,
  IonNote, IonButton, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.page.html',
  styleUrls: ['./employee-details.page.scss'],
  standalone: true,
  imports: [IonText, 
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonInput,
    IonNote, IonButton
  ]
})
export class EmployeeDetailsPage implements OnInit {
  employee: Employee = {
    id: 0,
    name: '',
    department: '',
    position: '',
    email: '',
    phone: ''
  };
  isNew = true;
  isFormValid = true;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.initializeEmployee();
  }

  private async initializeEmployee(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew = false;
      await this.loadEmployee(parseInt(id, 10));
    }
  }

  validateEmail(event: CustomEvent): void {
    const email = event.detail.value as string;
    if (!email) {
      this.isFormValid = true;
      return;
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
      this.isFormValid = false;
      return;
    }

    const [localPart, domain] = parts;
    
    // Basic email validation
    this.isFormValid = Boolean(
      localPart?.length > 0 &&
      domain?.length > 0 &&
      domain.includes('.') &&
      !email.includes(' ')
    );
  }

  validatePhone(event: CustomEvent): void {
    const phone = event.detail.value as string;
    if (!phone) {
      this.isFormValid = true;
      return;
    }

    // Check if phone contains only digits and is 10 characters long
    this.isFormValid = /^\d{10}$/.test(phone);
  }

  async saveEmployee(form: NgForm): Promise<void> {
    if (!form.valid || !this.isFormValid) {
      await this.showError('Please check the form for errors');
      return;
    }

    this.isLoading = true;
    try {
      if (this.isNew) {
        await this.dataService.addEmployee(this.employee);
        await this.showToast('Employee added successfully');
      } else {
        await this.dataService.updateEmployee(this.employee);
        await this.showToast('Employee updated successfully');
      }
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error saving employee:', error);
      await this.showError('Error saving employee');
    } finally {
      this.isLoading = false;
    }
  }

  private async loadEmployee(id: number): Promise<void> {
    this.isLoading = true;
    try {
      const employee = await this.dataService.getEmployeeById(id);
      if (employee) {
        this.employee = employee;
      } else {
        await this.showError('Employee not found');
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      await this.showError('Error loading employee details');
      this.router.navigate(['/home']);
    } finally {
      this.isLoading = false;
    }
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
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}