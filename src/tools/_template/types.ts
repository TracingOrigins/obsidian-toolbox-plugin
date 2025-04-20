import { ToolConfig } from "../../core/types/types";

/**
 * 模板工具配置接口
 * 定义了该工具的所有配置选项
 */
export interface TemplateConfig extends ToolConfig {
	// 基本设置
	/**
	 * 模板文件路径
	 * 指定要使用的模板文件的路径
	 */
	templatePath: string;
	/**
	 * 是否自动应用模板
	 * 启用后将在特定条件下自动应用模板
	 */
	autoApply: boolean;
	
	// 文本类型
	/**
	 * 文本设置示例
	 * 用于演示文本输入框的设置项
	 */
	textSetting: string;
	
	// 开关类型
	/**
	 * 开关设置示例
	 * 用于演示开关控件的设置项
	 */
	toggleSetting: boolean;
	
	// 下拉菜单类型
	/**
	 * 下拉菜单设置示例
	 * 用于演示下拉菜单控件的设置项
	 */
	dropdownSetting: string;
	
	// 滑块类型
	/**
	 * 滑块设置示例
	 * 用于演示滑块控件的设置项
	 */
	sliderSetting: number;
	
	// 颜色选择器类型
	/**
	 * 颜色选择器设置示例
	 * 用于演示颜色选择器控件的设置项
	 */
	colorSetting: string;
	
	// 文件选择器类型
	/**
	 * 文件选择器设置示例
	 * 用于演示文件选择器控件的设置项
	 */
	fileSetting: string;
	
	// 日期选择器类型
	/**
	 * 日期选择器设置示例
	 * 用于演示日期选择器控件的设置项
	 */
	dateSetting: string;
	
	// 时间选择器类型
	/**
	 * 时间选择器设置示例
	 * 用于演示时间选择器控件的设置项
	 */
	timeSetting: string;
	
	// 日期时间选择器类型
	/**
	 * 日期时间选择器设置示例
	 * 用于演示日期时间选择器控件的设置项
	 */
	datetimeSetting: string;
	
	// 多行文本类型
	/**
	 * 多行文本设置示例
	 * 用于演示多行文本输入框控件的设置项
	 */
	textareaSetting: string;
}
