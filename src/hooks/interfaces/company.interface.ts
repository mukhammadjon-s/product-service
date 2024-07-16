import { Observable } from 'rxjs/internal/Observable';

export interface ICompanyService {
  GetOne(data: { id: number }): Observable<any>;
  GetOneByName(data: any): Observable<any>;
}
