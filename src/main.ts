import {Plugin} from 'obsidian';
import {ToolManager} from './core/manager/ToolManager';
import {ToolboxSettingTab} from "./settings/ToolboxSettingsTab";
import {ToolSettings} from "./core/types/types";

/**
 * 工具箱设置接口
 * 定义了插件整体设置结构
 */
interface ToolboxSettings {
	/**
	 * 工具设置映射，键为工具ID
	 */
	tools: Record<string, ToolSettings>;
	/**
	 * 工具排序方式
	 */
	sortBy: 'name' | 'enabled';
	/**
	 * 视图模式
	 */
	viewMode: 'list' | 'grid';
	/**
	 * 设置打开模式
	 */
	openMode: 'tab' | 'modal';
	/**
	 * 已启用工具ID列表
	 */
	enabledTools: string[];
	/**
	 * 是否自动折叠常规选项
	 */
	autoCollapseGeneralSettings: boolean;
	/**
	 * 工具状态映射，键为工具ID
	 */
	toolStates: Record<string, boolean>;
}

/**
 * 默认设置
 * 插件初始化时使用的默认配置
 */
const DEFAULT_SETTINGS: ToolboxSettings = {
	tools: {},
	sortBy: 'name',
	viewMode: 'list',
	openMode: 'tab',
	enabledTools: [],
	autoCollapseGeneralSettings: false,
	toolStates: {}
}

/**
 * Toolbox插件主类
 * 这是插件的主入口点，负责初始化、加载和管理所有工具
 */
export default class ToolboxPlugin extends Plugin {
	// 插件基本设置，保存用户在插件设置界面调整的所有参数
	settings: ToolboxSettings;
	// 工具管理器实例，负责管理所有工具
	toolManager: ToolManager;
	// 设置选项卡实例，用于在Obsidian设置中显示插件设置
	settingsTab: ToolboxSettingTab;

	/**
	 * 插件加载方法，Obsidian在插件激活时调用
	 * 负责初始化插件、加载设置和注册各种功能
	 */
	async onload() {
		console.log('Loading Toolbox plugin...');

		try {
			// 检查是否在移动端
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			
			// 初始化工具管理器（现在会自动动态导入和注册工具）
			this.toolManager = new ToolManager(this);

			// 加载插件基本设置
			console.log('开始加载插件设置...');
			await this.loadSettings();
			console.log('插件设置加载完成');

			// 为每个工具加载默认配置
			for (const tool of this.toolManager.getAllTools()) {
				tool.config = tool.getDefaultConfig();
			}

			// 加载工具管理器设置
			console.log('开始加载工具管理器设置...');
			await this.toolManager.loadSettings();
			console.log('工具管理器设置加载完成');

			// 确保所有工具的设置都被保存
			await this.ensureAllToolSettings();

			// 确保enabledTools数组包含所有已启用的工具ID
			await this.syncEnabledToolsList();

			// 恢复之前启用的工具
			await this.restoreEnabledTools();

			// 添加设置选项卡到Obsidian设置界面
			this.settingsTab = new ToolboxSettingTab(this.app, this);
			this.addSettingTab(this.settingsTab);

			console.log('Toolbox plugin loaded successfully');
		} catch (error) {
			console.error('Failed to load Toolbox plugin:', error);
			console.error('错误详情:', error.stack);
			// 在移动端环境下，即使部分功能加载失败，也继续运行
			if (this.toolManager && this.toolManager.getAllTools().length === 0) {
				console.warn('No tools were successfully loaded');
			}
		}
	}

	/**
	 * 恢复之前启用的工具
	 * 根据保存的状态快照重新启用之前启用的工具
	 */
	private async restoreEnabledTools(): Promise<void> {
		try {
			// 获取保存的工具状态
			const savedData = await this.loadData();
			if (savedData && savedData.enabledTools) {
				console.log('恢复之前启用的工具:', savedData.enabledTools);
				// 重新启用之前启用的工具
				for (const toolId of savedData.enabledTools) {
					const tool = this.toolManager.getTool(toolId);
					if (tool) {
						await this.toolManager.enableTool(toolId);
						tool.config.enabled = true;
					}
				}
			}
		} catch (error) {
			console.error('恢复工具状态时出错:', error);
		}
	}

	/**
	 * 插件卸载方法，Obsidian在插件停用时调用
	 * 负责清理资源和移除注册的功能
	 */
	async onunload() {
		console.log('Unloading Toolbox plugin...');
		try {
			// 保存当前启用的工具状态
			await this.syncEnabledToolsList();

			// 禁用所有工具，确保它们能正确清理自己的资源
			for (const tool of this.toolManager.getAllTools()) {
				if (tool.config.enabled) {
					await this.toolManager.disableTool(tool.id);
				}
			}
		} catch (error) {
			console.error('Error while unloading Toolbox plugin:', error);
		}
	}

	/**
	 * 加载插件设置
	 * 从data.json文件读取保存的设置，并与默认设置合并
	 */
	async loadSettings() {
		console.log('开始加载设置...');
		this.app.workspace.trigger("css-change");
		const savedData = await this.loadData();
		console.log('从data.json加载的数据:', savedData);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);
		console.log('合并后的设置:', this.settings);
	}

	/**
	 * 保存插件设置
	 * 将当前插件设置和所有工具的设置保存到data.json文件
	 */
	async saveSettings() {

		// 1. 先获取最新的data.json数据
		const savedData = await this.loadData() || {};

		// 2. 更新插件基本设置
		const pluginSettings = {
			sortBy: this.settings.sortBy,
			viewMode: this.settings.viewMode,
			openMode: this.settings.openMode,
			enabledTools: this.settings.enabledTools,
			autoCollapseGeneralSettings: this.settings.autoCollapseGeneralSettings,
			toolStates: this.settings.toolStates
		};

		// 3. 更新保存数据中的插件基本设置
		Object.assign(savedData, pluginSettings);

		// 4. 对于每个工具，确保其设置保存在data.json中
		for (const tool of this.toolManager.getAllTools()) {
			savedData[tool.id] = JSON.parse(JSON.stringify(tool.config)); // 深拷贝避免引用问题
		}

		// 5. 保存最终数据到data.json
		await this.saveData(savedData);

		// 6. 重新加载设置以验证保存结果
		const verifyData = await this.loadData();
	}

	/**
	 * 更新插件设置
	 * 更新内存中的设置并保存到data.json
	 * @param settings 要更新的设置对象
	 */
	async updateSettings(settings: Partial<any>): Promise<void> {
		// 更新内存中的设置
		Object.assign(this.settings, settings);

		// 确保更新plugin.settings，这样能保存到data.json
		Object.assign(this.settings, settings);

		// 保存到data.json
		await this.saveSettings();

	}

	/**
	 * 更新工具启用状态
	 * @param toolId 工具ID
	 * @param enabled 是否启用
	 */
	async updateToolStatus(toolId: string, enabled: boolean): Promise<void> {
		const tool = this.toolManager.getTool(toolId);
		if (!tool) return;

		// 更新工具的配置
		tool.config.enabled = enabled;

		// 更新enabledTools数组
		// if (enabled) {
		// 	if (!this.settings.enabledTools.includes(toolId)) {
		// 		this.settings.enabledTools.push(toolId);
		// 	}
		// } else {
		// 	this.settings.enabledTools = this.settings.enabledTools.filter(id => id !== toolId);
		// }

		// 根据状态启用或禁用工具
		if (enabled) {
			await this.toolManager.enableTool(toolId);
		} else {
			await this.toolManager.disableTool(toolId);
		}

		// 保存设置
		await this.saveSettings();
		
		// 触发UI更新
		this.app.workspace.trigger("css-change");
	}

	/**
	 * 确保所有工具的设置都被保存到data.json
	 * 检查并初始化每个工具的配置
	 */
	async ensureAllToolSettings(): Promise<void> {

		// 强制刷新，确保获取最新数据
		this.app.workspace.trigger("css-change");
		const savedData = await this.loadData() || {};

		let needsSave = false;

		// 遍历所有工具，确保它们的设置都在savedData中
		for (const tool of this.toolManager.getAllTools()) {
			const toolId = tool.id;

			// 获取当前工具的完整默认配置
			const defaultConfig = tool.getDefaultConfig();

			// 如果工具设置不存在，创建新的
			if (!savedData[toolId]) {
				// 使用深拷贝以避免引用问题
				savedData[toolId] = JSON.parse(JSON.stringify(tool.config));
				needsSave = true;
				continue;
			}

			// 如果工具设置存在但不是对象，或者enabled属性不是布尔值，则重置
			if (typeof savedData[toolId] !== 'object' ||
				typeof savedData[toolId].enabled !== 'boolean') {
				savedData[toolId] = JSON.parse(JSON.stringify(tool.config));
				needsSave = true;
				continue;
			}

			// 合并已保存的配置和工具当前配置
			let toolUpdated = false;

			// 确保所有必要的属性都存在
			for (const key in defaultConfig) {
				if (savedData[toolId][key] === undefined) {
					savedData[toolId][key] = defaultConfig[key];
					toolUpdated = true;
				}
			}

			if (toolUpdated) {
				needsSave = true;
			}
		}

		// 如果有任何更新，保存所有设置
		if (needsSave) {
			await this.saveData(savedData);

			// 重新加载所有工具配置
			for (const tool of this.toolManager.getAllTools()) {
				await tool.loadSettings();
			}
		}
	}

	/**
	 * 同步启用的工具列表
	 * 确保settings.enabledTools数组正确反映每个工具的启用状态
	 */
	async syncEnabledToolsList(): Promise<void> {
		this.settings.enabledTools = Array.from(this.toolManager.getAllTools())
			.filter(tool => tool.config.enabled)
			.map(tool => tool.id);
		await this.saveSettings();
	}
}
