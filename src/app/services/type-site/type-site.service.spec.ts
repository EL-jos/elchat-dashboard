import { TestBed } from '@angular/core/testing';

import { TypeSiteService } from './type-site.service';

describe('TypeSiteService', () => {
  let service: TypeSiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeSiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
