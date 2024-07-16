import { Observable } from 'rxjs/internal/Observable';

export interface CompanyControllerInterface {
  GetAll(data: any): Observable<any>;
  GetOne(data: any): Observable<any>;
  Update(data: any): Observable<any>;
  AddNew(data: any): Observable<any>;
  Delete(data: any): Observable<any>;
  RegisterCompanyPaymentData(data: any): Observable<any>;
  GetOneByName(data: any): Observable<any>;
}
