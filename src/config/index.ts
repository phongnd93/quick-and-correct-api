import DatabaseConfig from './db.config';
import LogConfig from './log.config';
import AppConfig from './app.config';
import AuthConfig from './auth.config';

const configurations = [DatabaseConfig, AppConfig, LogConfig, AuthConfig];

export { configurations, DatabaseConfig, AppConfig, LogConfig, AuthConfig };
