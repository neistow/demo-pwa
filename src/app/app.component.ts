import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DATABASE, TodoItem, TodoList } from './core/database';
import { liveQuery } from 'dexie';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { MatListOption, MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatFormField, MatSelect, MatOption, MatLabel, ReactiveFormsModule, MatSelectionList, MatListOption],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private db = inject(DATABASE);

  protected selectedListControl = new FormControl<number | null>(null);

  protected lists$ = toSignal<TodoList[]>(
    liveQuery(() => this.db.todoLists.toArray())
  );

  protected listItems$ = toSignal<TodoItem[]>(
    this.selectedListControl.valueChanges.pipe(
      switchMap(todoListId => liveQuery(() =>
        this.db.todoItems
          .where({ todoListId })
          .toArray()
      ))
    )
  );

  protected onItemChange(id?: number, checked: boolean = false) {
    this.db.todoItems.update(id!, { done: checked });
  }
}
