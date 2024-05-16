import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MagicService {
  constructor(
    private httpClient: HttpClient,
  ) {
    this.carregarLista();
    /* this.carregarBooster(); */
   }

  url0 = 'https://api.magicthegathering.io/v1/sets';
  url1 = 'https://api.magicthegathering.io/v1/sets/';

  carregarLista(): Observable<any> { 
    return this.httpClient.get<any>(this.url0);
  }

  carregarBooster(i:string): Observable<any> { 
    return this.httpClient.get<any>(`${this.url1}${i}/booster`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      //erro no client
      errorMessage = error.error.message;
    } else {
      //erro do servidor (API, nesse caso)
      errorMessage = `Código do erro: ${error.status}, `+`mensagem: ${error.message}`;
    }
    return throwError(() =>errorMessage);
  }

}