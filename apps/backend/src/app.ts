import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { requestId } from './middleware/requestId';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.set('trust proxy', 1);

// 1. Helmet (security headers)
app.use(helmet());

// 2. Compression
app.use(compression());

// 3. CORS
const corsOrigin = config.NODE_ENV === 'production'
  ? config.FRONTEND_URL
  : config.FRONTEND_URL || '*';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  maxAge: 86400,
}));

// 4. Request ID middleware
app.use(requestId);

// 5. Morgan logger
morgan.token('id', (req: express.Request) => req.id);
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));

// 6. Rate Limiter middleware
app.use(rateLimiter);

// 7. Express JSON parser
app.use(express.json({ limit: '10kb' }));

// 8. Routes & 9. 404 Handler
app.use(routes);

// 10. Global Error Handler
app.use(errorHandler);

export default app;
