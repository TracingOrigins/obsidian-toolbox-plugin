import {ToolConfig} from '../../../core/types/types';

/**
 * 自动时间戳工具配置接口
 * 定义了该工具特有的配置选项
 */
export interface AutoTimestampsConfig extends ToolConfig {
	/**
	 * 日期格式
	 * 用于格式化创建和修改时间
	 */
	dateFormat: string;
	/**
	 * 是否启用创建时间功能
	 */
	enableCreatedTime: boolean;
	/**
	 * 是否启用修改时间功能
	 */
	enableModifiedTime: boolean;
	/**
	 * 修改时间戳的最小时间间隔（秒）
	 * 避免频繁更新修改时间
	 */
	modifyInterval: number | string;
	/**
	 * 忽略的文件夹列表（每行一个，支持通配符）
	 */
	ignoredFolders: string;
	/**
	 * 忽略的文件列表（每行一个，支持通配符）
	 */
	ignoredFiles: string;
	/**
	 * 忽略的标签列表（每行一个，支持通配符）
	 */
	ignoredTags: string;
	/**
	 * 是否使用文件创建日期作为created属性值的默认值
	 */
	useFileCreationDate: boolean;
	/**
	 * 是否使用文件修改日期作为modified属性值的默认值
	 */
	useFileModificationDate: boolean;
} 