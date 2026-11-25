import { withLambda } from '@netlify/aws-lambda-compat';
import serverless from 'serverless-http';
import { app } from '../../api/index.js';

const handler = serverless(app);

export default withLambda(handler);

export const config = {
  path: '/api/*',
};
