import { Router } from 'express';
import { CreateMessageDto } from '../dto/message/create-message.dto';
import { MessageQueryDto } from '../dto/message/message-query.dto';
import { IdParamDto } from '../dto/shared/id.param.dto';
import * as controller from '../controllers/message.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validator } from '../middlewares/validator.middleware';

const router = Router();
router.use(requireAuth);
router.get('/', validator(MessageQueryDto, 'query'), controller.list);
router.post('/', validator(CreateMessageDto, 'body'), controller.create);
router.get('/:id', validator(IdParamDto, 'params'), controller.get);
router.post('/:id/retry', validator(IdParamDto, 'params'), controller.retry);
export default router;
