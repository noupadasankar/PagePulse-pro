import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';

const router = Router();
const auditController = new AuditController();

router.post('/', auditController.audit);

// Declared before '/:id' so "links" isn't captured as an audit ID.
router.post('/links', auditController.checkLinks);

router.get('/:id', auditController.getById);

export default router;
