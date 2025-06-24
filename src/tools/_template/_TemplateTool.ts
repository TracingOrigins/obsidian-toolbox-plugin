import {WorkspaceLeaf} from 'obsidian';
import {ToolConfig} from '../../core/types/types';
import {ToolCommandConfig} from '../../core/types/types';
import {BaseTool} from '../../core/base/BaseTool';
import {displayTemplateSettings} from './_TemplateSettings';
import ToolboxPlugin from "../../main";
import { TemplateConfig } from './types';

/**
 * 模板工具类
 * 提供了一个工具实现的模板，展示了如何实现一个基本的工具类
 * 包含了各种类型设置项的示例
 */
export class _TemplateTool extends BaseTool<TemplateConfig> {
	/**
	 * 工具唯一ID
	 */
	id = 'template';
	/**
	 * 工具显示名称
	 */
	name = '工具模板';
	/**
	 * 工具排序名称
	 */
	sortName = 'gongjvmuban';
	/**
	 * 工具描述
	 */
	description = '提供模板功能和多种控件示例';

	/**
	 * 构造函数
	 * @param plugin 插件实例引用
	 */
	constructor(plugin: ToolboxPlugin) {
		super(plugin);
	}

	/**
	 * 注册工具命令
	 * 在Obsidian命令面板中添加相关命令
	 */
	private registerToolCommands(): void {
		// 定义命令
		const commands: ToolCommandConfig[] = [
			{
				id: 'template',
				name: '使用模板',
				checkCallback: (checking: boolean) => {
					// 首先检查工具是否启用
					if (!this.config.enabled) {
						return false; // 如果工具禁用，命令不可用
					}

					// 检查是否配置了模板路径，如果没有配置则不显示命令
					if (!this.config.templatePath) {
						return false;
					}

					// 只检查可用性，不执行命令
					if (checking) {
						return true;
					}

					// 实际执行命令
					const leaf = this.plugin.app.workspace.activeLeaf;
					if (leaf) {
						this.template(leaf);
					}
					return true;
				}
			}
		];
		
		// 注册命令到工具管理器
		(this.plugin.toolManager as any).registerToolCommands(this.id, commands);
	}

	/**
	 * 启用工具
	 * 注册工具命令
	 */
	enable(): void {
		// 注册工具命令
		this.registerToolCommands();
	}

	/**
	 * 禁用工具
	 * 注销工具命令
	 */
	disable(): void {
		// 注销命令
		(this.plugin.toolManager as any).unregisterToolCommands(this.id);
	}

	/**
	 * 获取默认配置
	 * 返回工具的所有设置项的默认值
	 * @returns 默认配置对象
	 */
	getDefaultConfig(): TemplateConfig {
		return {
			enabled: false,
			// 基本设置
			templatePath: '',
			autoApply: false,
			
			// 文本类型
			textSetting: '',
			
			// 开关类型
			toggleSetting: false,
			
			// 下拉菜单类型
			dropdownSetting: 'option1',
			
			// 滑块类型
			sliderSetting: 50,
			
			// 颜色选择器类型
			colorSetting: '#ff5500',
			
			// 文件选择器类型
			fileSetting: '',
			
			// 日期选择器类型
			dateSetting: '',
			
			// 时间选择器类型
			timeSetting: '',
			
			// 日期时间选择器类型
			datetimeSetting: '',
			
			// 多行文本类型
			textareaSetting: ''
		};
	}

	/**
	 * 验证配置有效性
	 * 检查配置对象中所有设置项的类型是否正确
	 * @param config 要验证的配置对象
	 * @returns 配置是否有效
	 */
	validateConfig(config: TemplateConfig): boolean {
		return (
			typeof config.enabled === 'boolean' &&
			typeof config.templatePath === 'string' &&
			typeof config.autoApply === 'boolean' &&
			typeof config.textSetting === 'string' &&
			typeof config.toggleSetting === 'boolean' &&
			typeof config.dropdownSetting === 'string' &&
			typeof config.sliderSetting === 'number' &&
			typeof config.colorSetting === 'string' &&
			typeof config.fileSetting === 'string' &&
			typeof config.dateSetting === 'string' &&
			typeof config.timeSetting === 'string' &&
			typeof config.datetimeSetting === 'string' &&
			typeof config.textareaSetting === 'string'
		);
	}

	/**
	 * 配置变更处理
	 * 当配置发生变化时调用，更新工具配置
	 * @param config 新的配置对象
	 */
	onConfigChange(config: TemplateConfig): void {
		this.config = config;
	}

	/**
	 * 显示工具设置界面
	 * @param containerEl 设置容器元素
	 */
	displaySettings(containerEl: HTMLElement): void {
		displayTemplateSettings(containerEl, this.plugin, this);
	}

	/**
	 * 应用模板
	 * 在当前工作区创建一个新的标签页并应用模板
	 * @param leaf 当前活动的标签页
	 */
	private template(leaf: WorkspaceLeaf) {
		const newLeaf = this.plugin.app.workspace.createLeafBySplit(leaf);
		const state = leaf.getViewState();
		newLeaf.setViewState(state);
	}
}

export * from './_TemplateSettings';
