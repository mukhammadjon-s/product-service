import { Observable } from 'rxjs';

export interface PvzControllerInterface {
  GetAll(data: any, metadata?: any): Observable<any>;
  GetOneById(data: any, metadata?: any): Observable<any>;
}
