import 'dotenv/config';
import {
  parseRuntimeConfig,
  RuntimeConfigurationError,
} from './runtime.js';

try {
  parseRuntimeConfig(process.env);
  console.log('level=info event=config.validated');
} catch (error) {
  if (error instanceof RuntimeConfigurationError) {
    console.error(
      `level=error event=config.invalid variable=${error.field} reason=${error.reason}`,
    );
  } else {
    console.error('level=error event=config.invalid reason=unexpected');
  }
  process.exitCode = 1;
}
