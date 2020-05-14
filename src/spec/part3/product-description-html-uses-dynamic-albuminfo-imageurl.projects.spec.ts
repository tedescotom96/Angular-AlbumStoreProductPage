import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { TestBed, async, inject } from '@angular/core/testing';

import { AppModule } from '../../app/app.module';

import { Http, BaseRequestOptions, Response, ResponseOptions, RequestOptions } from '@angular/http';

import { MockBackend, MockConnection } from '@angular/http/testing';

import { Observable } from 'rxjs/Observable';

import { Routes } from '@angular/router';

import { RouterTestingModule } from '@angular/router/testing';

const json = require('../../assets/album.json');

let productDescriptionComponentExists = false;
let ProductDescriptionComponent;
try {
  ProductDescriptionComponent = require('../../app/product-description/product-description.component.ts').ProductDescriptionComponent;
  productDescriptionComponentExists = true;
} catch (e) {
  productDescriptionComponentExists = false;
}

let productServiceExists = false;
let ProductService;
try {
  ProductService = require('../../app/product.service.ts').ProductService;
  productServiceExists = true;
} catch (e) {
  productServiceExists = false;
}

class AProductService {

}

describe('ProductDescription', () => {

  let product_service;
  let ProvidedService;
  let mock_backend;

  if(productServiceExists) {
    ProvidedService = ProductService
  } else {
    ProvidedService = AProductService;
  }

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule.withRoutes([])],
      providers: [ProvidedService, MockBackend, BaseRequestOptions,
        {
          provide: Http,
          useFactory: (mockBackend: MockBackend, defaultOptions: RequestOptions) => {
            return new Http(mockBackend, defaultOptions);
          },
          useClass: Http,
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    }).compileComponents();
  }));

  beforeEach(inject([ProvidedService, MockBackend], (providedService, mockBackend) => {
    product_service = providedService;
    mock_backend = mockBackend;
  }));

  it(`should use image url data from the albumInfo property in the HTML template @product-description-html-uses-dynamic-albuminfo-imageurl`, async(() => {
    since('The ProductService hasn\'t been created yet.').expect(productServiceExists).toBe(true);
    expect(productDescriptionComponentExists).toBe(true);

    mock_backend.connections.subscribe((connection: MockConnection) => {
      const options = new ResponseOptions({
        body: json
      });
      connection.mockRespond(new Response(options));
    });

    const ProductDescriptionFixture = TestBed.createComponent(ProductDescriptionComponent);
    ProductDescriptionFixture.detectChanges();

    since('The cover image in the ProductDescriptionComponent\'s HTML does not match the cover image from the JSON response.').expect(ProductDescriptionFixture.debugElement.nativeElement.querySelector('img').getAttribute('src')).toEqual(json.album.coverImage);

    let htmlString = ''
    try {
      htmlString = require('../../app/product-description/product-description.component.html');
    } catch (e) {
    }
    if (htmlString != '') {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlString, 'text/xml');
      const re = /{{\s*albumInfo\?\.album\.coverImage\s*}}/
      since('We\'d like you to query the albumInfo property directly for the cover image, and we\'re not seeing that you\'re doing that.').expect(htmlDoc.querySelector('img').getAttribute('src').match(re)).toEqual(jasmine.any(Array));
    } else {
      since('We\'d like you to query the albumInfo property directly for the cover image, and we\'re not seeing that you\'re doing that.').expect(0).toBe(1);
    }

  }));

});
