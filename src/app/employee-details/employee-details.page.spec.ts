import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { of } from 'rxjs';
import { EmployeeDetailsPage } from './employee-details.page';
import { DataService } from '../services/data.service';
import { Employee } from '../interfaces/employee';
import { FormsModule } from '@angular/forms';

describe('EmployeeDetailsPage', () => {
  let component: EmployeeDetailsPage;
  let fixture: ComponentFixture<EmployeeDetailsPage>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  const mockEmployee: Employee = {
    id: 1,
    name: 'John Doe',
    department: 'IT',
    position: 'Developer',
    email: 'john@example.com',
    phone: '1234567890'
  };

  const createCustomEvent = (value: string): CustomEvent => {
    return new CustomEvent('ionChange', { detail: { value } });
  };

  beforeEach(async () => {
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getEmployeeById', 'addEmployee', 'updateEmployee']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    const alertElementSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    const toastElementSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);

    alertControllerSpy.create.and.returnValue(Promise.resolve(alertElementSpy));
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastElementSpy));

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        EmployeeDetailsPage
      ],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employee on init when id is provided', async () => {
    dataServiceSpy.getEmployeeById.and.returnValue(Promise.resolve(mockEmployee));
    await component.ngOnInit();
    expect(dataServiceSpy.getEmployeeById).toHaveBeenCalledWith(1);
    expect(component.employee).toEqual(mockEmployee);
    expect(component.isNew).toBeFalse();
  });

  it('should validate email correctly', () => {
    const validEvent = createCustomEvent('test@example.com');
    const invalidEvent = createCustomEvent('invalid-email');

    component.validateEmail(validEvent);
    expect(component.isFormValid).toBeTrue();

    component.validateEmail(invalidEvent);
    expect(component.isFormValid).toBeFalse();
  });

  it('should validate phone number correctly', () => {
    const validEvent = createCustomEvent('1234567890');
    const invalidEvent = createCustomEvent('123');

    component.validatePhone(validEvent);
    expect(component.isFormValid).toBeTrue();

    component.validatePhone(invalidEvent);
    expect(component.isFormValid).toBeFalse();
  });

  it('should save new employee', async () => {
    component.isNew = true;
    component.employee = { ...mockEmployee, id: 0 };
    dataServiceSpy.addEmployee.and.returnValue(Promise.resolve());

    await component.saveEmployee({ valid: true } as any);

    expect(dataServiceSpy.addEmployee).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should update existing employee', async () => {
    component.isNew = false;
    component.employee = mockEmployee;
    dataServiceSpy.updateEmployee.and.returnValue(Promise.resolve());

    await component.saveEmployee({ valid: true } as any);

    expect(dataServiceSpy.updateEmployee).toHaveBeenCalledWith(mockEmployee);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show error when form is invalid', async () => {
    await component.saveEmployee({ valid: false } as any);
    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(dataServiceSpy.addEmployee).not.toHaveBeenCalled();
    expect(dataServiceSpy.updateEmployee).not.toHaveBeenCalled();
  });
});