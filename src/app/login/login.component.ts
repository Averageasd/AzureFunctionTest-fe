import { Component, inject, OnInit } from '@angular/core';
import { AccountInfo, PublicClientApplication } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  config = {
    auth: {
      clientId: environment.CLIENT_ID,
      authority: environment.AUTHORITY,
      redirectUri: environment.REDIRECT_URI,
      postLogoutRedirectUri: environment.REDIRECT_URI,
    },
  };
  msalInstance = new PublicClientApplication(this.config);
  account: AccountInfo = {} as AccountInfo;
  private router: Router = {} as Router;
  private accessToken: string = '';
  public canFetchData: boolean = false;
  private httpClient: HttpClient;

  constructor() {
    this.router = inject(Router);
    this.httpClient = inject(HttpClient);
  }
  async ngOnInit() {
    await this.msalInstance.initialize();
    await this.msalInstance.handleRedirectPromise();
  }

  async login() {
    try {
      const loginRequest = {
        scopes: [environment.SCOPES],
        prompt: 'login',
      };
      await this.msalInstance.loginPopup(loginRequest);
      const myAccounts = this.msalInstance.getAllAccounts();
      const account = myAccounts[0];
      this.account = account;

      const response = await this.msalInstance.acquireTokenSilent({
        account: account,
        scopes: [environment.SCOPES],
      });
      this.accessToken = response.accessToken;
      localStorage.setItem('token', this.accessToken);
      this.canFetchData = true;
    } catch (e) {
      console.log(e);
    }
  }

  async logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/']);
  }

  fetchData(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    this.httpClient
      .get<any>(
        environment.FETCH_CATEGORIES_URL,
        { 
          headers: headers, 
        }
      )
      .pipe(
        tap({
          next: (data) => {
            console.log(data);
          },
          error: (err) => {
            console.error('Error fetching users:', err);
          },
        })
      )
      .subscribe((data) => {
        console.log(data);
      });
  }
}
