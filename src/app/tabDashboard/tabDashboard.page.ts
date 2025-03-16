//import { Component } from '@angular/core';
import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var paypal: any; // Declare the paypal object

@Component({
  selector: 'app-tabDashboard',
  templateUrl: 'tabDashboard.page.html',
  styleUrls: ['tabDashboard.page.scss'],
  standalone: false,
})
export class TabDashboardPage implements OnInit, AfterViewInit {

  constructor() {}
  ngOnInit(): void {
    console.log('TabDashboardPage initialized');
  }

  
  ngAfterViewInit() {
    this.loadPayPalScript().then(() => {
      paypal.HostedButtons({
        hostedButtonId: 'QBSGDFGR8JRLN',
      }).render('#paypal-container-QBSGDFGR8JRLN');
    });
  }

  loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // was working (prod?)
      script.src = 'https://www.paypal.com/sdk/js?client-id=BAA4Ilhtt2soBfgWJ2gt1aC4XoW5NPhmbtqIrByAxfwviswOxKrOeoQm1y_EqR6M1DDZlVm2lhn0MgmwN8&components=hosted-buttons&enable-funding=venmo&currency=USD';
      //sandbox.  can't figure out sandbox with NO CODE button option. but above seems to wrok in prod. 
   
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

}
