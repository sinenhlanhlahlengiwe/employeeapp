import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';
import { Employee } from '../interfaces/employee';

describe('StorageService', () => {
  let service: StorageService;
  let storageMock: jasmine.SpyObj<Storage>;

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
    storageMock = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
    storageMock.create.and.returnValue(Promise.resolve(storageMock));
    storageMock.get.and.returnValue(Promise.resolve(mockEmployees));
    storageMock.set.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: storageMock }
      ]
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize storage on creation', async () => {
    await service.init();
    expect(storageMock.create).toHaveBeenCalled();
  });

  it('should get employees', (done) => {
    service.getEmployees().subscribe(employees => {
      expect(employees).toEqual(mockEmployees);
      done();
    });
  });

  it('should add an employee', async () => {
    const newEmployee: Omit<Employee, 'id'> = {
      name: 'Jane Doe',
      department: 'HR',
      position: 'Manager',
      email: 'jane@example.com',
      phone: '0987654321'
    };

    await service.addEmployee(newEmployee);
    expect(storageMock.set).toHaveBeenCalled();
  });

  it('should update an employee', async () => {
    const updatedEmployee: Employee = {
      ...mockEmployees[0],
      name: 'John Updated'
    };

    await service.updateEmployee(updatedEmployee);
    expect(storageMock.set).toHaveBeenCalled();
  });

  it('should delete an employee', async () => {
    await service.deleteEmployee(1);
    expect(storageMock.set).toHaveBeenCalled();
  });

  it('should get employee by id', async () => {
    const employee = await service.getEmployeeById(1);
    expect(employee).toEqual(mockEmployees[0]);
  });

  it('should handle storage errors', async () => {
    storageMock.get.and.returnValue(Promise.reject('Storage error'));
    
    try {
      await service.getEmployeeById(1);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
