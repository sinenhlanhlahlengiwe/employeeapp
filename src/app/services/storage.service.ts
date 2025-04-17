import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../interfaces/employee';
import { environment } from '../../environments/environment';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _employees = new BehaviorSubject<Employee[]>([]);
  private readonly STORAGE_KEY = environment.storageKey;

  constructor(
    private storage: Storage,
    private platform: Platform
  ) {
    this.init();
  }

  async init() {
    try {
      // Wait for platform to be ready
      await this.platform.ready();
      const storage = await this.storage.create();
      this._storage = storage;
      await this.loadEmployees();
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw error;
    }
  }

  private async loadEmployees() {
    try {
      const employees = await this._storage?.get(this.STORAGE_KEY) || [];
      this._employees.next(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  getEmployees(): Observable<Employee[]> {
    return this._employees.asObservable();
  }

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<void> {
    try {
      const employees = await this._storage?.get(this.STORAGE_KEY) || [];
      const newEmployee: Employee = {
        ...employee,
        id: Date.now()
      };
      employees.push(newEmployee);
      await this._storage?.set(this.STORAGE_KEY, employees);
      this._employees.next(employees);
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  async updateEmployee(employee: Employee): Promise<void> {
    try {
      const employees: Employee[] = await this._storage?.get(this.STORAGE_KEY) || [];
      const index = employees.findIndex((e: Employee) => e.id === employee.id);
      if (index > -1) {
        employees[index] = employee;
        await this._storage?.set(this.STORAGE_KEY, employees);
        this._employees.next(employees);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async deleteEmployee(id: number): Promise<void> {
    try {
      const employees: Employee[] = await this._storage?.get(this.STORAGE_KEY) || [];
      const filtered = employees.filter((e: Employee) => e.id !== id);
      await this._storage?.set(this.STORAGE_KEY, filtered);
      this._employees.next(filtered);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  async getEmployeeById(id: number): Promise<Employee | undefined> {
    try {
      const employees: Employee[] = await this._storage?.get(this.STORAGE_KEY) || [];
      return employees.find((e: Employee) => e.id === id);
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  }
  
  async ensureProperFocus() {
    // Wait for next render cycle
    await new Promise(resolve => setTimeout(resolve));
    
    // Find active element
    const activeElement = document.activeElement;
    if (activeElement && activeElement.hasAttribute('aria-hidden')) {
      // Move focus to first focusable element that's not hidden
      const firstFocusable = document.querySelector(
        'button:not([aria-hidden="true"]), [href]:not([aria-hidden="true"]), input:not([aria-hidden="true"]), select:not([aria-hidden="true"]), textarea:not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }
}