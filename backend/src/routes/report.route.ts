import express, { Router } from 'express';
import { AssociateReportDto } from '../dto/report/associate-report.dto';
import { ReportMetricsDto } from '../dto/report/report-metrics.dto';
import { ReportQueryDto } from '../dto/report/report-query.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/report.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { multipartFiles } from '../middlewares/private-upload.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', validator(ReportQueryDto, 'query'), controller.list);
router.post(
  '/import',
  express.raw({ type: 'multipart/form-data', limit: '110mb' }),
  multipartFiles('files', 5),
  controller.importFiles,
);
router.get('/:id/file', validator(IdParamDto, 'params'), controller.file);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.patch(
  '/:id/associate',
  validator(IdParamDto, 'params'),
  validator(AssociateReportDto, 'body'),
  controller.associate,
);
router.put(
  '/:id/metrics',
  validator(IdParamDto, 'params'),
  validator(ReportMetricsDto, 'body'),
  controller.updateMetrics,
);
router.post(
  '/:id/approve',
  validator(IdParamDto, 'params'),
  controller.approve,
);
router.post('/:id/retry', validator(IdParamDto, 'params'), controller.retry);
export default router;
