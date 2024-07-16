import { Observable } from 'rxjs/internal/Observable';

export interface OrderControllerInterface {
  GetAll(data: any, metadata?: any): Observable<any>;
  GetOne(data: any, metadata?: any): Observable<any>;
  addNew(data: any, metadata?: any): Observable<any>;
  Update(data: any, metadata?: any): Observable<any>;
  Delete(data: any, metadata?: any): Observable<any>;
  MergeUserWithFingerprint(data: any, metadata?: any): Observable<any>;
  DeleteVariantFromCard(data: any, metadata?: any): Observable<any>;
}
