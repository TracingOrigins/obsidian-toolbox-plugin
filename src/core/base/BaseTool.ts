import {Tool, ToolConfig} from '../types/types';
import ToolboxPlugin from "../../main";

/**
 * 工具基础抽象类
 * 为所有工具提供通用功能和接口实现
 * 定义了工具的基本结构和行为
 * @template T 工具配置类型，必须继承自ToolConfig
 */
export abstract class BaseTool<T extends ToolConfig> implements Tool {
	// 抽象属性，必须由子类定义
	/**
	 * 工具的唯一标识符
	 * 用于在数据存储和工具管理器中标识工具
	 */
	abstract id: string;
	/**
	 * 工具的显示名称
	 * 在用户界面中显示给用户
	 */
	abstract name: string;
    /**
     * 工具的排序名称
     * 用于排序，避免中文多音字导致的排序问题
     */
	abstract sortName: string;
	/**
	 * 工具的简短描述
	 * 向用户解释工具的功能
	 */
	abstract description: string;

	// 具体属性
	/**
	 * 工具的配置对象
	 * 存储工具所有设置和状态
	 */
	config: T;
	/**
	 * 插件实例引用
	 * 提供对插件功能和Obsidian API的访问
	 */
	plugin: ToolboxPlugin;

	/**
	 * 构造函数
	 * @param plugin 插件实例
	 */
	constructor(plugin: ToolboxPlugin) {
		this.plugin = plugin;
		// 使用默认配置初始化，子类必须正确处理这个过程
		// 可能在这里调用getDefaultConfig，但需要注意初始化顺序
		this.config = this.getDefaultConfig();
	}

	// 抽象方法，必须由子类实现
	/**
	 * 启用工具
	 * 当工具被激活时调用，应该注册事件监听器和命令
	 */
	abstract enable(): void;

	/**
	 * 禁用工具
	 * 当工具被停用时调用，应该清理资源和移除事件监听器
	 */
	abstract disable(): void;

	/**
	 * 获取默认配置
	 * 定义工具的默认设置
	 * @returns 默认配置对象
	 */
	abstract getDefaultConfig(): T;

	/**
	 * 验证配置有效性
	 * 确保配置对象包含所有必要字段且类型正确
	 * @param config 要验证的配置对象
	 * @returns 配置是否有效
	 */
	abstract validateConfig(config: T): boolean;

	/**
	 * 显示工具设置界面
	 * 在设置选项卡中渲染工具的设置界面
	 * @param containerEl 设置容器元素
	 */
	abstract displaySettings(containerEl: HTMLElement): void;

	// 子设置相关方法
	/**
	 * 启用特定子设置
	 * @param subSettingId 子设置ID
	 */
	async enableSubSetting(subSettingId: string): Promise<void> {
		if (!this.config.enabled) return;


		// 使用类型断言处理泛型索引问题
		(this.config as Record<string, any>)[subSettingId] = true;
		await this.saveSettings();
	}

	/**
	 * 禁用特定子设置
	 * @param subSettingId 子设置ID
	 */
	async disableSubSetting(subSettingId: string): Promise<void> {

		// 使用类型断言处理泛型索引问题
		(this.config as Record<string, any>)[subSettingId] = false;
		await this.saveSettings();
	}

	/**
	 * 检查子设置是否启用
	 * @param subSettingId 子设置ID
	 * @returns 子设置是否启用
	 */
	isSubSettingEnabled(subSettingId: string): boolean {
		// 首先检查工具是否启用
		if (!this.config.enabled) return false;

		// 然后检查子设置的状态
		return (this.config as Record<string, any>)[subSettingId] === true;
	}

	/**
	 * 检查是否所有指定的子设置都已启用
	 * @param subSettingIds 要检查的子设置ID数组
	 * @returns 是否所有子设置都已启用
	 */
	isAllSubSettingsEnabled(subSettingIds: string[]): boolean {
		// 首先检查工具本身是否启用
		if (!this.config.enabled) return false;

		// 然后检查每个子设置
		for (const id of subSettingIds) {
			if (!this.isSubSettingEnabled(id)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * 检查是否任一指定的子设置已启用
	 * @param subSettingIds 要检查的子设置ID数组
	 * @returns 是否有任一子设置已启用
	 */
	isAnySubSettingEnabled(subSettingIds: string[]): boolean {
		// 首先检查工具本身是否启用
		if (!this.config.enabled) return false;

		// 然后检查是否有任一子设置启用
		for (const id of subSettingIds) {
			if (this.isSubSettingEnabled(id)) {
				return true;
			}
		}

		return false;
	}

	// 已实现的通用方法
	/**
	 * 加载工具设置
	 * 从插件数据中读取工具配置
	 */
	async loadSettings(): Promise<void> {
		const settings = await this.plugin.loadData();
		if (settings && settings[this.id]) {
			// 获取默认配置和已保存配置
			const defaultConfig = this.getDefaultConfig();
			const savedConfig = settings[this.id] as T;

			// 合并所有配置
			this.config = {...defaultConfig, ...savedConfig};

			// 验证配置
			if (!this.validateConfig(this.config)) {
				console.warn(`[${this.id}] 配置验证失败，使用默认配置`);
				this.config = this.getDefaultConfig();
			}
		} else {
			// 如果没有找到设置，使用默认设置
			this.config = this.getDefaultConfig();
		}

		// 加载后触发配置变更事件
		if (this.onConfigChange) {
			this.onConfigChange(this.config);
		}
	}

	/**
	 * 保存工具设置
	 * 将工具配置保存到插件数据中
	 */
	async saveSettings(): Promise<void> {
		// 保存前验证配置
		if (!this.validateConfig(this.config)) {
			console.error(`[${this.id}] 配置验证失败，无法保存设置`);
			return;
		}

		try {
			// 强制从磁盘重新加载所有数据，避免使用缓存
			await this.plugin.loadSettings();

			// 获取最新的所有设置
			const settings = await this.plugin.loadData() || {};
			console.log(`[${this.id}] 当前保存的设置:`, settings);

			// 更新当前工具的设置
			settings[this.id] = JSON.parse(JSON.stringify(this.config)); // 深拷贝避免引用问题
			console.log(`[${this.id}] 更新后的设置:`, settings[this.id]);

			// 保存所有设置
			await this.plugin.saveData(settings);
			console.log(`[${this.id}] 设置已保存`);

			// 再次检查保存是否成功
			const verifySettings = await this.plugin.loadData() || {};
			console.log(`[${this.id}] 验证保存的设置:`, verifySettings[this.id]);

		} catch (error) {
			console.error(`[${this.id}] 保存设置时出错:`, error);
		}
	}

	/**
	 * 配置变更处理
	 * 当配置发生变化时调用，处理工具状态改变
	 * @param config 新的配置对象
	 */
	onConfigChange(config: T): void {
		if (this.validateConfig(config)) {
			// 保存旧的启用状态
			const wasEnabled = this.config.enabled;

			// 设置新的配置
			this.config = config;

			// 如果工具从禁用变为启用，调用enable方法
			if (!wasEnabled && config.enabled) {
				this.enable();
			}
			// 如果工具从启用变为禁用，调用disable方法
			else if (wasEnabled && !config.enabled) {
				this.disable();
			}
		} else {
			console.error(`[${this.id}] Invalid configuration provided to onConfigChange.`);
			// 可选：恢复到之前的配置或处理错误
		}
	}

	// 使loadSettings和saveSettings匹配接口（即使实际实现是异步的）
	// 如果实现需要异步，Tool接口需要更新
	// 目前，我们将异步实现细节保持在BaseTool内部
	// 如果接口期望void返回，我们需要强制转换实现以满足接口
	// 但是，实际的实现是异步的。我们假设可以调整接口
	// 或者调用代码会隐式处理Promise

} 
