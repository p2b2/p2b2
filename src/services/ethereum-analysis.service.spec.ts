import { TestBed, inject } from '@angular/core/testing';

import { EthereumAnalysisService } from './ethereum-analysis.service';

describe('EthereumAnalysisService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EthereumAnalysisService]
    });
  });

  it('should be created', inject([EthereumAnalysisService], (service: EthereumAnalysisService) => {
    expect(service).toBeTruthy();
  }));
});
