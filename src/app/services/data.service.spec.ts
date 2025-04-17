import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { DataService } from './data.service';
import { Employee } from '../interfaces/employee';
import { of, throwError } from 'rxjs';

describe('DataService', () => {
  let service: DataService;
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  const mockEmployees: Employee[] = [
    {
      id: 1,
      name: 'John Doe',
      department: 'IT',
      position: 'Developer',
      email: 'john@example.com',
      phone: '1234567890'
    }
  ];

  beforeEach(() => {
    storageServiceMock = jasmine.createSpyObj('StorageService', [
      'getEmployees',
      'addEmployee',
      'updateEmployee',
      'deleteEmployee',
      'getEmployeeById'
    ]);

    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: StorageService, useValue: storageServiceMock }
      ]
    });

    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEmployees', () => {
    it('should return employees from storage service', (done) => {
      storageServiceMock.getEmployees.and.returnValue(of(mockEmployees));

      service.getEmployees().subscribe({
        next: (employees) => {
          expect(employees).toEqual(mockEmployees);
          done();
        }
      });
    });

    it('should handle errors when fetching employees', (done) => {
      storageServiceMock.getEmployees.and.returnValue(throwError(() => new Error('Test error')));

      service.getEmployees().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch employees');
          done();
        }
      });
    });
  });

  describe('addEmployee', () => {
    it('should add employee successfully', async () => {
      const newEmployee: Omit<Employee, 'id'> = {
        name: 'Jane Doe',
        department: 'HR',
        position: 'Manager',
        email: 'jane@example.com',
        phone: '0987654321'
      };

      storageServiceMock.addEmployee.and.returnValue(Promise.resolve());

      await expectAsync(service.addEmployee(newEmployee)).toBeResolved();
      expect(storageServiceMock.addEmployee).toHaveBeenCalledWith(newEmployee);
    });

    it('should handle errors when adding employee', async () => {
      storageServiceMock.addEmployee.and.returnValue(Promise.reject('Test error'));

      await expectAsync(service.addEmployee({} as Employee))
        .toBeRejectedWithError('Failed to add employee');
    });
  });

  describe('updateEmployee', () => {
    it('should update employee successfully', async () => {
      const updatedEmployee = { ...mockEmployees[0], name: 'Updated Name' };
      storageServiceMock.updateEmployee.and.returnValue(Promise.resolve());

      await expectAsync(service.updateEmployee(updatedEmployee)).toBeResolved();
      expect(storageServiceMock.updateEmployee).toHaveBeenCalledWith(updatedEmployee);
    });

    it('should handle errors when updating employee', async () => {
      storageServiceMock.updateEmployee.and.returnValue(Promise.reject('Test error'));

      await expectAsync(service.updateEmployee({} as Employee))
        .toBeRejectedWithError('Failed to update employee');
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee successfully', async () => {
      storageServiceMock.deleteEmployee.and.returnValue(Promise.resolve());

      await expectAsync(service.deleteEmployee(1)).toBeResolved();
      expect(storageServiceMock.deleteEmployee).toHaveBeenCalledWith(1);
    });

    it('should handle errors when deleting employee', async () => {
      storageServiceMock.deleteEmployee.and.returnValue(Promise.reject('Test error'));

      await expectAsync(service.deleteEmployee(1))
        .toBeRejectedWithError('Failed to delete employee');
    });
  });

  describe('getEmployeeById', () => {
    it('should get employee by id successfully', async () => {
      storageServiceMock.getEmployeeById.and.returnValue(Promise.resolve(mockEmployees[0]));

      const result = await service.getEmployeeById(1);
      expect(result).toEqual(mockEmployees[0]);
      expect(storageServiceMock.getEmployeeById).toHaveBeenCalledWith(1);
    });

    it('should handle errors when getting employee by id', async () => {
      storageServiceMock.getEmployeeById.and.returnValue(Promise.reject('Test error'));

      await expectAsync(service.getEmployeeById(1))
        .toBeRejectedWithError('Failed to fetch employee');
    });
  });
});