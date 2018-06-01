import { TestBed, inject } from '@angular/core/testing';

import { SelectedAssetsService } from './selected-assets.service';

describe('SelectedAssetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelectedAssetsService]
    });
  });

  it('should be created', inject([SelectedAssetsService], (service: SelectedAssetsService) => {
    expect(service).toBeTruthy();
  }));
});
