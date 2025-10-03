import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-conferma-eliminazione',
  templateUrl: './conferma-eliminazione.component.html',
  styleUrls: ['./conferma-eliminazione.component.scss']
})
export class ConfermaEliminazioneComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfermaEliminazioneComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  


}
