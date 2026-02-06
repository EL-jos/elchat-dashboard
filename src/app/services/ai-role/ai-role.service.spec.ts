import { TestBed } from '@angular/core/testing';

import { AiRoleService } from './ai-role.service';

describe('AiRoleService', () => {
  let service: AiRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
