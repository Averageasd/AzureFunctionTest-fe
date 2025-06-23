import { Component, inject, OnInit } from '@angular/core';
import { AccountInfo, PublicClientApplication } from '@azure/msal-browser';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  constructor() {
    this.router = inject(Router);
  }
  async ngOnInit() {

    await this.msalInstance.initialize();
    await this.msalInstance.handleRedirectPromise();
  }


  async login() {
    try {
      const loginRequest = {
        scopes: ["User.Read"],
        prompt: "login"
      };
      await this.msalInstance.loginPopup(loginRequest);
      const myAccounts = this.msalInstance.getAllAccounts();
      const account = myAccounts[0];
      this.account = account;

      const response = await this.msalInstance.acquireTokenSilent({
        account: account,
        scopes: [environment.SCOPES],
      });

      const resolvedRes = response.accessToken;
      console.log(resolvedRes);
    }
    catch (e) {
      console.log(e);
    };

  }

  async logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);

  }
}
