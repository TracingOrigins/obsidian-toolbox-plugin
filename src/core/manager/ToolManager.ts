import {Tool} from '../types/types';
import {ToolCommandConfig} from '../types/types';
import {BaseTool} from '../base/BaseTool';
import ToolboxPlugin from "../../main";

/**
 * 工具模块类型定义
 * 用于处理动态导入的工具模块，支持任意键值对
 */
type ToolModule = {
	[key: string]: any;
};

/**
 * 工具管理器类
 * 负责管理插件的所有工具，包括：
 * 1. 工具的注册和注销
 * 2. 工具的启用和禁用
 * 3. 工具配置的管理
 * 4. 工具命令的注册和管理
 */
export class ToolManager {
	/**
	 * 工具映射表
	 * 键：工具ID
	 * 值：工具实例
	 */
	tools: Map<string, Tool>;

	/**
	 * 插件实例引用
	 * 用于访问插件上下文和设置
	 */
	plugin: ToolboxPlugin;

	/**
	 * 工具命令映射表
	 * 键：工具ID
	 * 值：该工具注册的命令配置数组
	 */
	private commands: Map<string, ToolCommandConfig[]> = new Map();

	/**
	 * 构造函数
	 * @param plugin 插件实例，用于访问插件上下文
	 */
	constructor(plugin: ToolboxPlugin) {
		this.plugin = plugin;
		this.tools = new Map();
		this.commands = new Map();
		this.initializeTools();
	}

	/**
	 * 初始化工具
	 * 动态导入并注册所有工具模块
	 * 从工具目录加载所有工具类并实例化
	 */
	private async initializeTools() {
		// 使用传统的动态导入方式
		try {
			// 检查是否在移动端
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			
			// 手动导入所有工具
			const toolModules = [
				import('../../tools/auto-timestamps/core/AutoTimestampsTool'),
				import('../../tools/tab-copy/TabCopyTool'),
				import('../../tools/inline-code-copy/InlineCodeCopyTool'),
				import('../../tools/front-matter-sort/core/FrontMatterSortTool'),
				import('../../tools/path-copy/PathCopyTool'),
				// import('../../tools/_template/_TemplateTool')
			];

			// 等待所有导入完成
			const modules = await Promise.all(toolModules.map(module => 
				module.catch(error => {
					console.error('Failed to load tool module:', error);
					return null;
				})
			)) as (ToolModule | null)[];

			// 处理每个模块
			for (const module of modules) {
				if (!module) continue; // 跳过加载失败的模块
				
				// 查找模块中导出的工具类
				for (const key in module) {
					const exportedItem = module[key];
					// 检查是否是工具类（继承自 BaseTool 或实现了 Types 接口）
					if (typeof exportedItem === 'function' &&
						(exportedItem.prototype instanceof BaseTool ||
						 (exportedItem.prototype &&
						  'id' in exportedItem.prototype &&
						  'name' in exportedItem.prototype &&
						  'description' in exportedItem.prototype))) {
						try {
							// 创建工具实例并注册
							const toolInstance = new exportedItem(this.plugin);
							this.registerTool(toolInstance);
						} catch (error) {
							console.error(`Failed to initialize tool ${key}:`, error);
						}
					}
				}
			}
		} catch (error) {
			console.error('Failed to initialize tools:', error);
			// 在移动端环境下，即使部分工具加载失败，也继续运行
			if (this.tools.size === 0) {
				console.warn('No tools were successfully loaded');
			}
		}
	}

	/**
	 * 注册工具
	 * 将工具实例添加到工具映射中，并加载其设置
	 * 如果工具已注册，会发出警告
	 * @param tool 要注册的工具实例
	 */
	registerTool(tool: Tool): void {
		if (this.tools.has(tool.id)) {
			console.warn(`Tool ${tool.id} is already registered`);
			return;
		}

		this.tools.set(tool.id, tool);
	}

	/**
	 * 注销工具
	 * 从工具映射中移除工具，并禁用该工具
	 * @param toolId 要注销的工具ID
	 */
	unregisterTool(toolId: string): void {
		const tool = this.tools.get(toolId);
		if (tool) {
			tool.disable();
			this.tools.delete(toolId);
		}
	}

	/**
	 * 获取工具实例
	 * @param toolId 工具ID
	 * @returns 工具实例，如果未找到则返回undefined
	 */
	getTool(toolId: string): Tool | undefined {
		return this.tools.get(toolId);
	}

	/**
	 * 获取所有已注册的工具
	 * @returns 所有工具实例的数组
	 */
	getAllTools(): Tool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * 获取工具的设置
	 * @param toolId 工具ID
	 * @returns 工具的配置对象，如果工具不存在则返回null
	 */
	getToolSettings(toolId: string): any {
		const tool = this.tools.get(toolId);
		if (!tool) {
			return null;
		}

		return {
			config: tool.config
		};
	}

	/**
	 * 更新工具配置
	 * 验证并应用新的工具配置，同时保存到data.json
	 * @param toolId 工具ID
	 * @param config 新的配置对象
	 * @returns 是否成功更新配置
	 */
	async updateToolConfig(toolId: string, config: any): Promise<boolean> {
		const tool = this.tools.get(toolId);
		if (!tool) {
			return false;
		}

		if (tool.validateConfig(config)) {

			// 更新工具配置
			tool.config = JSON.parse(JSON.stringify(config)); // 深拷贝避免引用问题

			// 通知工具配置已更改
			tool.onConfigChange?.(tool.config);

			// 立即保存到data.json
			try {
				await tool.saveSettings();
				return true;
			} catch (error) {
				return false;
			}
		}

		return false;
	}

	/**
	 * 启用工具
	 * @param toolId 工具ID
	 */
	async enableTool(toolId: string): Promise<void> {
		const tool = this.tools.get(toolId);
		if (!tool) {
			console.warn(`工具 ${toolId} 不存在`);
			return;
		}

		try {
			// 确保工具配置已更新
			tool.config.enabled = true;
			
			// 启用工具
			await tool.enable();
			
			console.log(`工具 ${toolId} 已启用`);
		} catch (error) {
			console.error(`启用工具 ${toolId} 时出错:`, error);
			// 如果启用失败，恢复配置状态
			tool.config.enabled = false;
			throw error;
		}
	}

	/**
	 * 禁用工具
	 * @param toolId 工具ID
	 */
	async disableTool(toolId: string): Promise<void> {
		const tool = this.tools.get(toolId);
		if (!tool) {
			console.warn(`工具 ${toolId} 不存在`);
			return;
		}

		try {
			// 确保工具配置已更新
			tool.config.enabled = false;
			
			// 禁用工具
			await tool.disable();
			
			console.log(`工具 ${toolId} 已禁用`);
		} catch (error) {
			console.error(`禁用工具 ${toolId} 时出错:`, error);
			// 如果禁用失败，恢复配置状态
			tool.config.enabled = true;
			throw error;
		}
	}

	/**
	 * 启用子设置
	 * 启用工具的特定子设置项
	 * @param toolId 工具ID
	 * @param subSettingId 子设置ID
	 */
	async enableSubSetting(toolId: string, subSettingId: string): Promise<void> {
		const tool = this.tools.get(toolId);
		if (tool) {
			// 无论工具是否启用，都保存子设置状态

			// 直接在工具配置上设置属性
			(tool.config as Record<string, any>)[subSettingId] = true;

			// 通知工具配置已更改
			tool.onConfigChange?.(tool.config);

			// 立即保存到data.json
			await tool.saveSettings();
		}
	}

	/**
	 * 禁用子设置
	 * 禁用工具的特定子设置项
	 * @param toolId 工具ID
	 * @param subSettingId 子设置ID
	 */
	async disableSubSetting(toolId: string, subSettingId: string): Promise<void> {
		const tool = this.tools.get(toolId);
		if (tool) {

			// 直接在工具配置上设置属性
			(tool.config as Record<string, any>)[subSettingId] = false;

			// 通知工具配置已更改
			tool.onConfigChange?.(tool.config);

			// 立即保存到data.json
			await tool.saveSettings();
		}
	}

	/**
	 * 检查子设置是否启用
	 * @param toolId 工具ID
	 * @param subSettingId 子设置ID
	 * @returns 子设置是否启用
	 */
	isSubSettingEnabled(toolId: string, subSettingId: string): boolean {
		const tool = this.tools.get(toolId);
		if (!tool) return false;

		// 首先检查工具是否启用
		if (!tool.config.enabled) return false;

		// 然后检查子设置的具体状态
		return (tool.config as Record<string, any>)[subSettingId] === true;
	}

	/**
	 * 加载所有工具的设置
	 * 从data.json加载所有工具的配置
	 */
	async loadSettings(): Promise<void> {
		// 强制刷新，确保获取最新数据
		this.plugin.app.workspace.trigger("css-change");
		const savedData = await this.plugin.loadData() || {};

		// 等待所有工具的loadSettings方法完成
		const promises = Array.from(this.tools.values()).map(async (tool) => {
			try {
				// 如果工具设置存在，先更新配置
				if (savedData[tool.id]) {
					// 获取默认配置
					const defaultConfig = tool.getDefaultConfig();
					// 合并配置，确保默认值不会被覆盖
					tool.config = {...defaultConfig, ...savedData[tool.id]};
					
					// 验证配置
					if (!tool.validateConfig(tool.config)) {
						console.warn(`[${tool.id}] 配置验证失败，使用默认配置`);
						tool.config = defaultConfig;
					}
				}
				
				// 加载工具设置
				await tool.loadSettings();
				
				// 根据配置状态启用或禁用工具
				if (tool.config.enabled) {
					tool.enable();
				} else {
					tool.disable();
				}
			} catch (error) {
				console.error(`加载工具 ${tool.id} 的设置时出错:`, error);
			}
		});

		await Promise.all(promises);
		
		// 同步enabledTools数组
		await this.plugin.syncEnabledToolsList();
	}

	/**
	 * 保存所有工具的设置
	 * 将所有工具的配置保存到data.json
	 */
	async saveSettings(): Promise<void> {

		// 等待所有工具的saveSettings方法完成
		const promises = Array.from(this.tools.values()).map(async (tool) => {
			try {
				await tool.saveSettings();
			} catch (error) {
				console.error(`保存工具 ${tool.id} 的设置时出错:`, error);
			}
		});

		await Promise.all(promises);
	}

	/**
	 * 启用所有工具
	 * 遍历所有工具并启用它们
	 */
	enableAllTools(): void {
		for (const tool of this.tools.values()) {
			if (tool.config.enabled) {
				this.enableTool(tool.id);
			}
		}
	}

	/**
	 * 禁用所有工具
	 * 遍历所有工具并禁用它们
	 */
	disableAllTools(): void {
		for (const toolId of this.tools.keys()) {
			this.disableTool(toolId);
		}
	}

	/**
	 * 注册工具命令
	 * 为工具注册一组命令
	 * @param toolId 工具ID
	 * @param commands 要注册的命令配置数组
	 */
	registerToolCommands(toolId: string, commands: ToolCommandConfig[]): void {
		if (!this.tools.has(toolId)) {
			console.warn(`[ToolManager] 无法为未注册的工具 ${toolId} 注册命令`);
			return;
		}

		// 存储工具的命令配置
		this.commands.set(toolId, commands);

		// 为工具添加命令
		for (const cmd of commands) {
			// 获取插件ID并构建完整的命令ID
			const pluginId = this.plugin.manifest.id;
			// 使用Obsidian推荐的命令ID格式：[pluginId]:[commandId]
			const fullCommandId = `${pluginId}:${toolId}-${cmd.id}`;

			try {
				// 获取工具实例以便使用其名称
				const tool = this.tools.get(toolId);
				// 构建完整的命令名称，包含工具名称
				const fullCommandName = `${tool?.name || toolId}: ${cmd.name}`;

				// 注册命令到 Obsidian
				this.plugin.addCommand({
					id: fullCommandId,
					name: fullCommandName,
					checkCallback: cmd.checkCallback,
					callback: cmd.callback,
					hotkeys: cmd.hotkeys
				});

			} catch (error) {
				console.error(`[ToolManager] 注册命令 ${fullCommandId} 失败:`, error);
				console.error(`[ToolManager] 错误详情:`, error.stack);
			}
		}
	}

	/**
	 * 注销工具命令
	 * 移除工具的所有已注册命令
	 * @param toolId 工具ID
	 */
	unregisterToolCommands(toolId: string): void {
		// 从内部存储中移除命令
		this.commands.delete(toolId);
		// 注意：Obsidian API不支持直接移除命令，所以已注册的命令会保留到插件重载
	}

	/**
	 * 获取工具命令
	 * @param toolId 工具ID
	 * @returns 工具的命令配置数组，如果未找到则返回undefined
	 */
	getToolCommands(toolId: string): ToolCommandConfig[] | undefined {
		return this.commands.get(toolId);
	}

	/**
	 * 获取所有命令
	 * @returns 所有工具的命令映射表
	 */
	getAllCommands(): Map<string, ToolCommandConfig[]> {
		return this.commands;
	}

	/**
	 * 卸载所有工具
	 * 在插件卸载时调用
	 */
	async unload(): Promise<void> {
		// 禁用所有工具，但不修改它们的配置
		for (const tool of this.tools.values()) {
			try {
				if (tool.config.enabled) {
					tool.disable();
				}
			} catch (error) {
				console.error(`卸载工具 ${tool.id} 时出错:`, error);
			}
		}
	}
}
