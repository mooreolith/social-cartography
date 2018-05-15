/*
  jquery.social-cartography.js

  Joshua Marshall Moore
  May 11th, 2018
  Monmouth, Oregon, United States
*/

(function($){

  var fourd = null;
  var selected = null;
  
  var persons = [];
  var groups = [];
  var roles = [];
  
  var last_person = null;
  var last_group = null;
  
  var role_id = 0;
  var Role = function(person, group){
    this.id = role_id++;
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
    
    /*
    if(Person.all){
      var found_person = Person.all.find(person => { return person.name == name; });

      if(found_person){
        var result = confirm("A person with this name was found, use them?");
        if(result){
          return found_person;
        }
      }
    }else{
      Person.all = [this];
    }
    */
    
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
    
    /*
    if(Group.all){
      var found_group = Group.all.find(group => {return group.name === name});
      
      if(found_group){
        if(confirm("A group with this name was found, use it?")){
          return found_group;
        }
      }
    }else{
      Group.all = [this];
    }
    */
    
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
      border: '1px solid black',
      width: 1000,
      height: 500
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
        width: 1000,
        height: 500
      }, options);
      
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
      
      var on_mousedown = function(event){
        console.log(event);
        selected = fourd.resolve_click(event);
        fourd.selected = selected;
      };
      
      $(this).addClass('fourd');
      $(this).addClass('social-cartography');
      
      $('#display').on('mousedown', on_mousedown);
      
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
            if(typeof entity === "Person"){
              delete persons[persons.indexOf(entity)];
            }
            if(typeof entity === "Group"){
              delete groups[groups.indexOf(entity)];
            }
            if(typeof entity === "Role"){
              delete roles[roles.indexOf(entity)];
            }
            fourd.graph.remove_vertex(selected);
          }
          
          if(key === 'clear'){
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
      
      return this;
    },
    
    add_person: function(name, picture){
      last_person = name;
      person = new Person(name, picture);
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

      return person;
    },
    
    remove_person: function(){},
    
    add_group: function(name, picture){
      last_group = name;
      group = new Group(name, picture);
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
    }
  });
}(jQuery));