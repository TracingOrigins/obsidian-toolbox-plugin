import {ToolConfig} from '../../../core/types/types';

/**
 * Front Matter 排序工具配置接口
 */
export interface FrontMatterSortConfig extends ToolConfig {
    /**
     * 属性排序顺序（每行一个属性名）
     * 按照此顺序对 front-matter 中的属性进行排序
     */
    propertyOrder: string;
    
    /**
     * 是否在文件保存时自动排序
     */
    autoSortOnSave: boolean;
    
    /**
     * 是否保持未在排序列表中指定的属性在原位置
     */
    keepUnspecifiedProperties: boolean;
    
    /**
     * 忽略的文件夹列表（每行一个，支持通配符）
     */
    ignoredFolders: string;
    
    /**
     * 忽略的文件列表（每行一个，支持通配符）
     */
    ignoredFiles: string;
    
    /**
     * 是否在启动时自动对所有文件进行排序
     */
    autoSortOnStartup: boolean;
} 