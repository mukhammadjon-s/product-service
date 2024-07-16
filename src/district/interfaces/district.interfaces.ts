import { Observable } from 'rxjs';

export interface DistrictControllerInterface {
  findById(data: any): Observable<any>;
}
