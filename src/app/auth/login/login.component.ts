import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, of } from 'rxjs';

function mustContainMark(control: AbstractControl){
  if (control.value.includes('?')){
    return null;
  }
  return {doesNotContainQuestionMark: true}
}

function emailIsUnique(control: AbstractControl){
  if (control.value === 'test@example.com'){
    return of(null);
  }
  return of({notUnique: true})
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  ngOnInit(){
    const savedForm = window.localStorage.getItem('saved-login-form');

    if(savedForm) {
      const loadedForm = JSON.parse(savedForm);
      this.form.patchValue({
        email: loadedForm.email,
      })
    }

   const subs = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        window.localStorage.setItem(
          'saved-login-form',
          JSON.stringify({email: value.email})
        )
      }
    });
    this.destroyRef.onDestroy(() => subs.unsubscribe());
  }
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email],
      asyncValidators: [emailIsUnique]
    }),
    password: new FormControl('',{
      validators: [Validators.required, Validators.minLength(6), mustContainMark],
    })
  });

  get emailIsvalid(){
    return(this.form.controls.email.touched && 
    this.form.controls.email.dirty && 
    this.form.controls.email.invalid);
  }

  get passwordIsvalid(){
    return(this.form.controls.password.touched && 
    this.form.controls.password.dirty && 
    this.form.controls.password.invalid);
  }

 onSubmit(){
  console.log(this.form);

}
}