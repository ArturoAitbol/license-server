import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[draggableModal]'
})
export class DraggableModalDirective implements AfterViewInit {
    private modalElement: HTMLElement;
    private topStart: number;
    private leftStart: number;
    private isDraggable: boolean;
    private handleElement: HTMLElement;

    constructor(public element: ElementRef) {
    }

    ngAfterViewInit() {
        let element = this.element.nativeElement;
        this.handleElement = this.element.nativeElement;
        this.handleElement.style.cursor = 'pointer';
        for (let level = 3; level > 0; level--) {
            element = element.parentNode;
        }
        this.modalElement = element;
        this.modalElement.style.position = 'relative';
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        if (event.button === 2 || (this.handleElement && event.target !== this.handleElement)) {
            return;
        }
        this.isDraggable = true;
        this.topStart = event.clientY - Number(this.modalElement.style.top.replace('px', ''));
        this.leftStart = event.clientX - Number(this.modalElement.style.left.replace('px', ''));
        event.preventDefault();
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        this.isDraggable = false;
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (this.isDraggable) {
            this.modalElement.style.top = (event.clientY - this.topStart) + 'px';
            this.modalElement.style.left = (event.clientX - this.leftStart) + 'px';
        }
    }

    @HostListener('document:mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent) {
        this.isDraggable = false;
    }
}