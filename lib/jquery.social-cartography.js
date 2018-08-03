/*
  jquery.social-cartography.js

  Joshua Marshall Moore
  May 11th, 2018
  Monmouth, Oregon, United States
*/

(function($){

  var fourd = null;
  var selected = null;
  
  persons = [];
  groups = [];
  roles = [];
  
  var last_person = null;
  var last_group = null;
  
  var role_id = 0;
  var Role = function(person, group){
    this.id = role_id++;
    this.type = "Role";
    
    if(Role.all){
      Role.all.push(this);
    }else{
      Role.all = [this];
    }
    
    this.person = person ? person : new Person();
    this.group = group ? group : new Group();
    
    this.vertex = fourd.graph.add_vertex({
      cube: {size: 5, color: 0x000000}, 
      label: {fontsize: 10, text: person.name + '@' + group.name}
    });
    
    fourd.graph.add_edge(this.vertex, this.person.vertex);
    fourd.graph.add_edge(this.vertex, this.group.vertex);
  }
  
  var person_id = 0;
  var Person = function(name, picture){
    this.id = person_id++;
    this.type = "Person";
    
    if(!Person.all){
      Person.all = [this];
    }else{
      Person.all.push(this);
    }
    
    this.name = name ? name : prompt(`Person's name: `, last_person);
    this.picture = picture ? picture : prompt(`${this.name}'s picture: `, `img/person.png`);
    this.since = null;
    this.until = null;
    this.roles = new Set();
    
    return this;
  };
  Person.prototype.all = [];
  
  Person.prototype.add_role = function(group_name){
    var group = new Group(group_name);
    var role = new Role(this, group);
    this.roles.add(role);
    return this;
  }
  
  var group_id = 0;
  var Group = function(name, picture){
    this.id = group_id++;
    this.type = "Group";
    
    this.name = name ? name : prompt(`Group's name: `, last_group);
    this.picture = picture ? picture : prompt(`Picture of ${this.name}`, 'img/group.jpg');
    this.since = null;
    this.until = null;
    
    if(!Group.all){
      Group.all = [this];
    }else{
      Group.all.push(this);
    }
    
    this.roles = new Set();

    return this;
  };
  Group.prototype.all = [];
  
  Group.prototype.add_role = function(role){
    var person = new Person();
    var role = new Role(person, this);
    this.roles.add(role);
    return this;
  }

  
  $.widget('jmm.social_cartography', {
    options: {
      background: 0xffffff,
      border: 0,
      width: window.innerwidth,
      height: window.innerHeight - 100
    },
    
    _create: function(options){
      var settings = {};
      $.extend(settings, this.options, {
        display: 'block',
        margin: 0,
        padding: 0,
        border: 0,
        overflow: 'hidden',
        background: 0xfffffff,
        width: window.innerWidth,
        height: window.innerHeight-50
      }, options);
      
      var that = this;
      
      $(this).css($.extend({
        display: "block",
        border: this.options.border
      }, this.options));

      $(this).width(this.options.width);
      $(this).height(this.options.height);
      
      fourd = new FourD();
      fourd.init(this.element, {
        width: this.options.width,
        height: this.options.height,
        background: this.options.background
      });
      
      var role_exists = function(person, group){
        for(var i=0; i<roles.length; i++){
          if(roles[i].person.id == person.id && roles[i].group.id == group.id){
            return roles[i];
          }
        }
        return false;
      }

      var on_mousedown = function(event){
        selected = fourd.resolve_click(event);
        fourd.selected = selected;
        
        if(selected){
          var info = `
  <label>Type: </label>${selected.entity.type}<br />
  <label>Name: </label>${selected.entity.name}<br />
  <label>Picture: </label>${selected.entity.picture}<br />
  <label>Since: </label>${selected.entity.since}<br />
  <label>Until: </label>${selected.entity.until}<br />
  <hr />`;

          var html = info;
          var that = this;

          console.log(selected.entity.type);
          
          if(selected.entity.type == "Person"){
            console.log(selected.entity.type)
            var person = selected.entity;
            
            $('#person-name').val(person.name);
            $('#person-picture').val(person.picture);
            $('#person-since-date').val(person.since);
            $('#person-since-time').val(person.since);
            $('#person-until-date').val(person.until);
            $('#person-until-time').val(person.until);
          }
          
          if(selected.entity.type == "Group"){
            console.log(selected.entity.type)
            var group = selected.entity;
            
            $('#group-name').val(group.name);
            $('#group-picture').val(group.picture);
            $('#group-since-date').val(group.since);
            $('#group-since-time').val(group.since);
            $('#group-until-date').val(group.until);
            $('#group-until-time').val(group.until);
          }
          /*
          if(selected.entity.type == "Person"){
            var person = selected.entity;
            
            html += `<ul id="groups" style="list-style: none";>`;
            
            var group, add_role;
            for(var i=0; i<groups.length; i++){
              group = groups[i];
              html += `<li><input class="group" type="checkbox" x-data-group-id="${group.id}" selected="${role_exists(person, group) ? "true" : "false"}" />${person.name + '@' + group.name}</li>`;
            }
              
            html = $('#info').html(html);
            $('li>input.group').on('change', function(event){
              var group_id = parseInt($(this).prop('x-data-group-id'));
              var group = groups.find(group => {return group.id === group_id});
              var group_selected = $(this).attr('selected');
              if(group_selected){
                var role = $(that).social_cartography('add_role', person, group);
              }else{
                var role = role_exists(person, group);
                $(that).social_cartography('remove_role', role);
              }
              
            });
          }
          
          if(selected.entity.type == "Group"){
            var group = selected.entity;
            
            html += `<ul id="persons" style="list-style: none";>`;

            var person, add_role;
            for(var i=0; i<groups.length; i++){
              person = persons[i];
              html += `<li><input class="person" type="checkbox" x-data-person-id="${person.id}" selected="${role_exists(person, group) ? "true" : "false"}" />${person.name + '@' + group.name}</li>`;  
            }
            
            html = $('#info').html(html);
            $('li>input.person').on('change', function(event){
              var person_id = parseInt($(this).prop('x-data-person-id'));
              var person = persons.find(person => { return person.id === person_id});
              var person_selected = $(this).attr('selected');
              if(person_selected){
                var role = $(that).social_cartography('add_role', person, group);
              }else{
                var role = role_exists(person, group);
                $(that).social_cartography('remove_role', role);
              }
            });
            
          }
          */
        }
      };
      
      var on_dblclick = function(event){
        console.log(selected);
        fourd.select(selected);
      };
      
      $(this).addClass('fourd');
      $(this).addClass('social-cartography');
      
      $('#display').on('mousedown', on_mousedown);
      // $('#display').on('dblclick', on_dblclick);
      
      $.contextMenu({
        selector: '#display',
        callback: function(key, options, rootMenu, originalEvent){
          
          if(key === 'add_person'){
            return $(this).social_cartography('add_person');
          }
          
          if(key === 'add_group'){
            return $(this).social_cartography('add_group');
          }
          
          if(key === 'add_role'){
            return $(this).social_cartography('add_role'); 
          }
          
          if(key === 'remove'){
            var entity = selected.entity;
            if(entity.type === "Person"){
              persons = persons.splice(persons.indexOf(entity), 1);
            }
            if(entity.type === "Group"){
              groups = groups.splice(groups.indexOf(entity), 1);
            }
            if(entity.type === "Role"){
              roles = roles.splice(roles.indexOf(entity), 1);
            }
            fourd.graph.remove_vertex(selected);
          }
          
          if(key === 'clear'){
            roles = [];
            persons = [];
            groups = [];
            
            role_id = 0;
            person_id = 0;
            group_id = 0;
            
            return $(this).social_cartography('clear');
          }
          
          return;
        },
        items: {
          'add_person': {name: "Add Person"},
          'add_group': {name: 'Add Group'},
          'add_role': {name: 'Add Role', disabled: () => { return fourd.selected && !fourd.selected.entity; }},
          'remove': {name: 'Remove selected', disabled: () => { return !selected; }},
          'clear': {name: 'Clear scene'}
        }
      });
      
      $('#info').accordion();
      
      $('#submit-person').click(function(){
        var info = {
          name: $('#person-name').val(),
          picture: ($('#person-picture').val() ? $('#person-picture').val() : 'img/person.png'),
          since: $('#person-since-date').val() + 'T' + $('#person-since-time').val(),
          until: $('#person-until-date').val() + 'T' + $('#person-until-time').val()
        };
        
        $('#display').social_cartography('add_person', info.name, info.picture, info.since, info.until);
      });
      
      $('#submit-group').click(function(){
        var info = {
          name: $('#group-name').val(),
          picture: ($('#group-picture').val() ? $('#group-picture').val() : 'img/group.png'),
          since: $('#group-since-date').val() + 'T' + $('#group-since-time').val(),
          until: $('#group-until-date').val() + 'T' + $('#group-until-time').val()
        };
        
        $('#display').social_cartography('add_group', info.name, info.picture, info.since, info.until);
      });
      
      var role_person = null;
      $('#role-person').autocomplete({
        source: function(req, res){ 
          res(persons
            .filter(person => { 
              if(person.name.includes(req.term)){
                role_person = person;
                console.log(person.name);
                return true;
              }else{
                return false;
              }})
            .map(person => { return person.name; }));
        },
        select: function(event, ui){
          new_role_person = ui.item;
        }
      });
      
      var role_group = null;
      $('#role-group').autocomplete({
        source: function(req, res){ 
          res(groups
            .filter(group => { 
              if(group.name.includes(req.term)){
                role_group = group;
                console.log(group.name);
                return true;
              }else{
                return false;
              } 
            })
            .map(group => { 
              return group.name; 
            })
          );
        },
        select: function(event, ui){
          role_group = ui.item;
        },
      });
      
      $('#submit-role').click(function(){
        $('#isplay').social_cartography('add_role', role_person, role_group);
      });
      
      return this;
    },
    
    add_person: function(name, picture, since, until){
      last_person = name;
      person = new Person(name, picture, since, until);
      person_vertex = fourd.graph.add_vertex({
        cube: {
          size: 10,
          texture: person.picture
        },
        label: {
          text: person.name,
          fontsize: 10
        }
      });
      
      person.vertex = person_vertex;
      person.vertex.entity = person;
      
      persons.push(person);
      
      person_entry = $(`
<li class="person"><input type="checkbox" x-data-person-id="${person.id}}"><img src="${person.picture}" width="25" height="25" />${person.name}</li>
`);
      
      $('#persons-list').append(person_entry);

      return person;
    },
    
    remove_person: function(){},
    
    add_group: function(name, picture, since, until){
      last_group = name;
      group = new Group(name, picture, since, until);
      group_vertex = fourd.graph.add_vertex({
        cube: {
          size: 10,
          texture: group.picture
        },
        label: {
          text: group.name,
          fontsize: 10
        }
      });

      group.vertex = group_vertex;
      group.vertex.entity = group;
      
      groups.push(group);
      
      group_entry = $(`
<li class="group"><input type="checkbox" x-data-group-id="${group.id}}"><img src="${group.picture}" width="100" height="100" />${group.name}</li>
`);
      
      $('#persons-list').append(person_entry);
      
      return group;
    },
    
    remove_group: function(){},
    
    add_role: function(person, group){
      if(!person){
        var person_name = prompt("Person's name?", last_person);
        if(person_name === ""){
          return;
        }
        last_person = person_name;
        var person = Person.all.find(person => person.name.match(person_name));
        if(!person){
          person = new Person(person_name);
        }
      }

      if(!group){
        var group_name = prompt("Group's name?", last_group);
        if(group_name === ""){
          return;
        }
        last_group = group_name;
        var group = Group.all.find(group => group.name.match(group_name));
        if(!group){
          group = new Group(group_name);
        }
      }
      
      var role = new Role(person, group);
      
      roles.push(role);
      
      return role;
    },
    
    remove_role: function(){},
    
    clear: function(){
      fourd.graph.clear();
      persons = [];
      groups = [];
      roles = [];
    },
    
    prepare_download: function(){
      var output = {vertices: [], edges: [], persons: [], groups: [], roles: []};
      
      for(var i in fourd.graph.V){
        var vertex = fourd.graph.V[i];
        output.vertices.push({
          id: vertex.id, 
          cube: {
            texture: vertex.options.cube.texture, 
            color: vertex.options.cube.color, 
            size: vertex.options.cube.size
          },
          label: {
            text: vertex.options.label.text
          }
        });
      }
      for(var i in fourd.graph.E){
      var edge = fourd.graph.E[i];
        output.edges.push([edge.source.id, edge.target.id]);
      }
      
      if(Person.all){
        for(var i=0; i<Person.all.length; i++){
          var person = Person.all[i];
          output.persons.push({
            id: person.id,
            name: person.name,
            picture: person.picture,
            since: person.since,
            until: person.until
          });
        }
      }
      
      if(Group.all){
        for(var i=0; i<Group.all.length; i++){
          var group = Group.all[i];
          output.groups.push({
            id: group.id,
            name: group.name,
            picture: group.picture,
            since: group.since,
            until: group.until
          });
        }
      }
      
      if(Role.all){
        for(var i=0; i<Role.all.length; i++){
          var role = Role.all[i];
          output.roles.push({
            id: role.id,
            person_id: role.person.id,
            group_id: role.group.id
          });
        }
      }
      
      var filename = prompt("Enter a filename: ", "graph.sc.json");
      download(JSON.stringify(output), filename);
    },
    
    import: function(){
      var input = document.getElementById('upload').files[0];
      var reader = new FileReader();
      reader.readAsText(input);
      reader.onload = function(e){
        input = reader.result;
        input = JSON.parse(input);
        
        var imported_groups = new Map();
        for(var i in input.groups){
          var group = $('#display').social_cartography('add_person', input.groups[i].name, input.groups[i].picture);
          imported_groups.set(input.groups[i].id, group);
        }
        
        var imported_persons = new Map();
        for(var i in input.persons){
          var person = $('#display').social_cartography('add_group', input.persons[i].name, input.persons[i].picture);
          imported_persons.set(input.persons[i].id, person);
        }
        
        for(var i in input.roles){
          var role = $('#display').social_cartography('add_role', imported_persons.get(input.roles[i].person_id), imported_groups.get(input.roles[i].group_id)); 
        }
      }
    },
    
    _destroy: function(){
      $(this).removeClass('social-cartogrraphy');
    },
    
    select: function(entity){
      
    }
  });
}(jQuery));