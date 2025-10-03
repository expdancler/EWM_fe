import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input('descrizione') descrizioneModal: string = '';
  @Input() idModal!: string;
  
  @Output() emitClick = new EventEmitter<any>();

  emitNewClick() {
    this.emitClick.emit("clicked");
  }

}
