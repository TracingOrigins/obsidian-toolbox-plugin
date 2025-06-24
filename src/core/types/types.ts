import {App, Hotkey, Plugin, PluginSettingTab} from 'obsidian';
import ToolboxPlugin from "../../main";

/**
 * 工具配置接口
 * 定义了所有工具配置的基本结构
 */
export interface ToolConfig {
    /**
     * 工具是否启用
     */
    enabled: boolean;
    /**
     * 允许添加任意额外属性
     */
    [key: string]: any;
}

/**
 * 工具接口
 * 定义了工具必须实现的属性和方法
 */
export interface Tool {
    // 基本属性
    /**
     * 工具的唯一标识符
     */
    id: string;
    /**
     * 工具的显示名称
     */
    name: string;
    /**
     * 工具的排序名称
     * 用于排序，避免中文多音字导致的排序问题
     */
    sortName: string;
    /**
     * 工具的简短描述
     */
    description: string;
    /**
     * 工具的配置对象
     */
    config: ToolConfig;
    /**
     * 插件实例引用
     */
    plugin: Plugin;

    // 生命周期方法
    /**
     * 启用工具
     * 当工具被激活时调用，应注册事件监听器和命令
     */
    enable(): void;

    /**
     * 禁用工具
     * 当工具被停用时调用，应清理资源和移除事件监听器
     */
    disable(): void;

    // 配置相关方法
    /**
     * 获取默认配置
     * @returns 默认配置对象
     */
    getDefaultConfig(): ToolConfig;

    /**
     * 验证配置有效性
     * @param config 要验证的配置对象
     * @returns 配置是否有效
     */
    validateConfig(config: ToolConfig): boolean;

    /**
     * 配置变更处理（可选实现）
     * @param config 新的配置对象
     */
    onConfigChange?(config: ToolConfig): void;

    // 设置相关方法
    /**
     * 加载工具设置
     */
    loadSettings(): Promise<void>;

    /**
     * 保存工具设置
     */
    saveSettings(): Promise<void>;

    /**
	 * 显示工具设置界面
	 * @param containerEl 设置容器元素
	 */
    displaySettings(containerEl: HTMLElement): void;

    // 子设置相关方法
    /**
     * 启用特定子设置
     * @param subSettingId 子设置ID
     */
    enableSubSetting(subSettingId: string): Promise<void>;
    
    /**
     * 禁用特定子设置
     * @param subSettingId 子设置ID
     */
    disableSubSetting(subSettingId: string): Promise<void>;
    
    /**
     * 检查子设置是否启用
     * @param subSettingId 子设置ID
     * @returns 子设置是否启用
     */
    isSubSettingEnabled(subSettingId: string): boolean;
}

/**
 * 工具管理器接口
 * 定义了管理工具集合的方法
 */
export interface ToolManager {
    /**
     * 存储所有工具的映射
     */
    tools: Map<string, Tool>;
    /**
     * 插件实例引用
     */
    plugin: Plugin;

    /**
     * 注册工具
     * @param tool 工具实例
     */
    registerTool(tool: Tool): void;

    /**
     * 注销工具
     * @param toolId 工具ID
     */
    unregisterTool(toolId: string): void;

    /**
     * 获取工具
     * @param toolId 工具ID
     * @returns 工具实例或undefined
     */
    getTool(toolId: string): Tool | undefined;

    /**
     * 获取所有工具
     * @returns 所有已注册工具的数组
     */
    getAllTools(): Tool[];

    /**
     * 启用工具
     * @param toolId 工具ID
     */
    enableTool(toolId: string): Promise<void>;

    /**
     * 禁用工具
     * @param toolId 工具ID
     */
    disableTool(toolId: string): Promise<void>;

    /**
     * 加载所有工具设置
     */
    loadSettings(): Promise<void>;

    /**
     * 保存所有工具设置
     */
    saveSettings(): Promise<void>;

    /**
     * 更新工具配置
     * @param toolId 工具ID
     * @param config 新的配置对象
     * @returns 是否成功更新
     */
    updateToolConfig(toolId: string, config: any): Promise<boolean>;

    /**
     * 获取工具设置
     * @param toolId 工具ID
     * @returns 工具设置对象
     */
    getToolSettings(toolId: string): any;

    /**
     * 启用子设置
     * @param toolId 工具ID
     * @param subSettingId 子设置ID
     */
    enableSubSetting(toolId: string, subSettingId: string): Promise<void>;

    /**
     * 禁用子设置
     * @param toolId 工具ID
     * @param subSettingId 子设置ID
     */
    disableSubSetting(toolId: string, subSettingId: string): Promise<void>;

    /**
     * 检查子设置是否启用
     * @param toolId 工具ID
     * @param subSettingId 子设置ID
     * @returns 子设置是否启用
     */
    isSubSettingEnabled(toolId: string, subSettingId: string): boolean;
    
    // 命令相关方法
    /**
     * 注册工具命令
     * @param toolId 工具ID
     * @param commands 命令配置数组
     */
    registerToolCommands(toolId: string, commands: any[]): void;
    
    /**
     * 注销工具命令
     * @param toolId 工具ID
     */
    unregisterToolCommands(toolId: string): void;
    
    /**
     * 获取工具的命令
     * @param toolId 工具ID
     * @returns 命令配置数组或undefined
     */
    getToolCommands(toolId: string): any[] | undefined;
    
    /**
     * 获取所有命令
     * @returns 所有命令的映射，键为工具ID
     */
    getAllCommands(): Map<string, any[]>;
}

/**
 * 工具设置接口
 * 定义了工具设置UI和行为
 */
export interface ToolSettings {
    /**
     * 工具实例引用
     */
    tool: Tool;
    /**
     * 插件实例引用
     */
    plugin: Plugin;

    /**
     * 显示设置界面
     * @param containerEl 设置容器元素
     */
    display(containerEl: HTMLElement): void;

    /**
     * 加载设置
     */
    loadSettings(): void;

    /**
     * 保存设置
     */
    saveSettings(): void;
}

/**
 * 工具测试结果接口
 * 用于存储工具测试的结果
 */
export interface ToolTestResult {
    /**
     * 测试是否成功
     */
    success: boolean;
    /**
     * 测试结果消息
     */
    message: string;
    /**
     * 错误对象（如果测试失败）
     */
    error?: Error;
}

/**
 * 工具测试结果记录接口
 * 用于存储多个工具的测试结果
 */
export interface ToolTestResults {
    /**
     * 工具测试结果映射，键为工具ID
     */
    [toolId: string]: ToolTestResult;
}

/**
 * 工具命令配置接口
 * 定义了工具命令的结构
 */
export interface ToolCommandConfig {
	/**
	 * 命令ID
	 */
	id: string;
	/**
	 * 命令名称
	 */
	name: string;
	/**
	 * 检查回调函数
	 * 确定命令是否可用并执行命令
	 * @param checking 是否只检查可用性
	 */
	checkCallback?: (checking: boolean) => boolean | void;
	/**
	 * 命令回调函数
	 * 当命令执行时调用
	 */
	callback?: () => any;
	/**
	 * 命令热键配置
	 */
	hotkeys?: Hotkey[];
}
