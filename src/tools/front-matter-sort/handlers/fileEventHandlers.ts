import {TFile} from 'obsidian';
import {FrontMatterSortTool} from '../core/FrontMatterSortTool';

/**
 * 处理文件保存事件
 * @param this 工具实例
 * @param file 保存的文件
 */
export async function handleFileSave(this: FrontMatterSortTool, file: TFile): Promise<void> {
    // 基本检查
    if (this.processingFile || !this.config.enabled || !this.config.autoSortOnSave) {
        return;
    }

    // 检查文件类型
    if (file.extension !== 'md') {
        return;
    }

    // 检查是否需要忽略该文件
    if (await this.shouldIgnoreFile(file)) {
        return;
    }

    try {
        this.processingFile = true;
        await this.sortFileFrontMatter(file);
    } catch (error) {
        console.error(`[${this.id}] 排序 front-matter 时出错:`, error);
    } finally {
        this.processingFile = false;
    }
} 