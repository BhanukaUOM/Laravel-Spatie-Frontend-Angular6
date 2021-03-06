import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { SnotifyService } from 'ng-snotify';
import { Router } from '@angular/router';
import {NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';

import { TokenService } from '../../services/token.service'

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roles = null;     //Store API Data
  permissions = null;     //Store all permissions Data
  error = [];       //Form errors
  keyword = null;   //Current Search Keyword
  pagination = {    //Current Pagination data
    'page' :  '1',
    'max' : '10'
  }

  data = {          //Role Update Data
    "id" : null,
    "name" : null,
    "permission" : []
  }

  form = {         //New Role add Data
    "name" : null,
    "permission" : []
  }

  headers = {     //Token for API Authorization
    'Authorization' : this.token.get()
  }

  sortData = {        //Current Sort Data
    "col" : null,
    "order" : null
  }

  constructor(private pg: NgbPaginationConfig, private token : TokenService, private http : HttpClient, private router : Router,private api : ApiService, private notify : SnotifyService) {
    pg.boundaryLinks = true;
    pg.rotate = true;
  }

  ngOnInit() {
    this.notify.clear();
    this.notify.info("Loading...", {timeout: 0});
    if(this.keyword)
      this.api.get('roles?search=' + this.keyword + '&page=' + this.pagination.page + '&sort=' + this.sortData.col + '&order=' + this.sortData.order, this.headers).subscribe(
        data => this.datahandler(data),
        error => { this.notify.clear(); this.token.remove(); this.router.navigateByUrl("/login"); }
      ); else
      this.api.get('roles?page=' + this.pagination.page + '&sort=' + this.sortData.col + '&order=' + this.sortData.order, this.headers).subscribe(
        data => this.datahandler(data),
        error => { this.token.remove(); this.router.navigateByUrl("/login"); }
      );
      this.api.get('permission', this.headers).subscribe(
        data => { console.log(data); this.permissions=data; },
        error => { this.notify.clear(); this.notify.error(error.error.message); }
      );
  }

  datahandler(data){
    console.log(data.data);
    this.notify.clear();
    this.roles = data.data;
    this.pagination.max = data.total;
  }

  //sort handler
  sort(col){
    console.log(col);
    if(this.sortData.order=="asc" && this.sortData.col==col){
      this.sortData.order = "desc"
    } else if(this.sortData.order=="desc" && this.sortData.col==col){
      this.sortData.order = null;
      col = null;
    } else {
      this.sortData.order = "asc"
    }
    this.sortData.col = col;
    this.ngOnInit();
  }

  //Paginate Handling
  paginateClick(page){
    console.log(page);
    this.pagination.page = page;
    this.ngOnInit();
  }

  //Serach Handling
  search(){
    this.ngOnInit();
  }

  //Role edit Handling
  edit(id){
    this.notify.clear();
    this.data.name = null;
    this.data.permission = [];
    this.api.get('roles/'+id, this.headers).subscribe(
      data => this.editDataHandler(data),
      error => this.notify.error("Role Not Found", {timeout: 0})
    );
    this.data.id = id;
    var modal = document.getElementById('editModal');
    modal.style.display = "block";
  }

  editDataHandler(data){
    this.data.name = data.name;
    for(var i=0; i<data.permissions.length; i++)
      this.data.permission.push(data.permissions[i].name);
  }

  checkbox(event){
    if(event.srcElement.checked){
      this.data.permission.push(event.srcElement.name);
    } else {
      var index =this.data.permission.indexOf(event.srcElement.name);
      this.data.permission.splice(index, index+1);
    }
    console.log(this.data.permission);
  }

  editsubmit(){
    this.notify.clear();
    this.notify.info("Wait...", {timeout: 0});
    this.api.put('roles/'+this.data.id, this.data, this.headers).subscribe(
      data => {
        this.notify.clear();
        this.notify.info("Role Updated Successfully", {timeout: 2000});
        this.ngOnInit();
        this.closeEditModal();
      },
      error => { this.notify.clear(); this.error = error.error.errors; }
    );
  }

  closeEditModal(){
    this.error = [];
    var modal = document.getElementById('editModal');
    modal.style.display = "none";
  }

  //Role delete Handling
  delete(id){
    this.notify.clear();
    this.notify.warning('Are you sure you want to detele this Role?', 'Delete Role', {
      timeout: 0,
      showProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      buttons: [
        {text: 'Yes', action: () => {
          var headers = {
            'Authorization' : this.token.get()
          }
          return this.api.delete('roles/'+id, headers).subscribe(
            data => {this.notify.info("Success", {timeout: 2000}); this.ngOnInit(); },
            error => this.notify.error(error.message, {timeout: 0})
          );
        }, bold: false},
        {text: 'No'}
      ]
    });
  }

  //New Role add Handling
  add(){
    this.notify.clear();
    this.form.name = null;
    this.form.permission = [];
    var modal = document.getElementById('addModal');
    modal.style.display = "block";
  }

  addModalSubmit(){
    this.notify.clear();
    this.notify.info("Wait...", {timeout: 0});
    this.api.post('roles', this.form, this.headers).subscribe(
      data => {
        this.notify.clear();
        this.notify.info("Role Added Successfully", {timeout: 2000});
        this.ngOnInit();
        this.closeAddModal();
      },
      error => { this.notify.clear(); this.error = error.error.errors; }
    );

  }

  checkboxAdd(event){
    if(event.srcElement.checked){
      this.form.permission.push(event.srcElement.name);
    } else {
      var index =this.form.permission.indexOf(event.srcElement.name);
      this.form.permission.splice(index, index+1);
    }
    console.log(this.form.permission);
  }

  closeAddModal(){
    this.error = [];
    var modal = document.getElementById('addModal');
    modal.style.display = "none";
  }

}

