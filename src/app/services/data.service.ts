import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Employee } from '../interfaces/employee';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly timeoutDuration = environment.apiTimeout;
  private readonly maxRetries = 3;

  constructor(private storageService: StorageService) {}

  getEmployees(): Observable<Employee[]> {
    return this.storageService.getEmployees().pipe(
      timeout({
        each: this.timeoutDuration,
        with: () => throwError(() => new Error('Request timed out'))
      }),
      catchError(error => {
        console.error('Error fetching employees:', error);
        return throwError(() => new Error('Failed to fetch employees'));
      })
    );
  }

  async addEmployee(employee: Omit<Employee, 'id'>): Promise<void> {
    if (!this.validateEmployee(employee)) {
      throw new Error('Invalid employee data');
    }

    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        await this.storageService.addEmployee(employee);
        return;
      } catch (error) {
        attempts++;
        if (attempts === this.maxRetries) {
          console.error('Error adding employee after retries:', error);
          throw new Error('Failed to add employee');
        }
        await this.delay(1000);
      }
    }
  }

  async updateEmployee(employee: Employee): Promise<void> {
    if (!this.validateEmployee(employee)) {
      throw new Error('Invalid employee data');
    }

    try {
      await this.storageService.updateEmployee(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async deleteEmployee(id: number): Promise<void> {
    try {
      await this.storageService.deleteEmployee(id);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  }

  async getEmployeeById(id: number): Promise<Employee | undefined> {
    try {
      return await this.storageService.getEmployeeById(id);
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Failed to fetch employee');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateEmployee(employee: Partial<Employee>): boolean {
    // Check required fields
    if (!employee.name?.trim() || 
        !employee.department?.trim() || 
        !employee.position?.trim()) {
      return false;
    }

    // Check email if provided
    if (employee.email && !this.isValidEmail(employee.email)) {
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    if (!email || email.trim().length === 0) return false;

    // Split email into parts
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;
    
    // Validate local part
    if (!localPart || localPart.length === 0) return false;
    
    // Validate domain
    if (!domain || domain.length === 0) return false;
    
    // Check for dot in domain
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    // Check domain extension
    const extension = domainParts[domainParts.length - 1];
    if (!extension || extension.length < 2) return false;

    // Check for spaces
    if (email.includes(' ')) return false;

    return true;
  }

}