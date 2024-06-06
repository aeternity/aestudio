import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss']
})

export class CodeBlockComponent implements OnInit {
  @Input() code: string;

  ngOnInit(): void {
    // Optionally, syntax highlighting can be added here
  }
}