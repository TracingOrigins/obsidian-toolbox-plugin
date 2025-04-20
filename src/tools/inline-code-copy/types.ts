import { ToolConfig } from '../../core/types/types';

/**
 * 行内代码复制工具的配置类型
 */
export interface InlineCodeCopyConfig extends ToolConfig {
    enabled: boolean;
    showCopyNotification: boolean;
    copyNotificationText: string;
    copyNotificationDuration: number;
} 
