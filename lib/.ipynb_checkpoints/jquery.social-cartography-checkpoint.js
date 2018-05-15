/*
  jquery.social-cartography.js

  Joshua Marshall Moore
  May 11th, 2018
  Monmouth, Oregon, United States
*/

(function($){

  var fourd = null;
  
  var persons = new Map();
  var groups = new Map();
  var roles = new Map();
  
  var Role = function(person, group){
    
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
  
  var Person = function(name, id, picture){
    if(Person.all){
      var found_person = Person.all.find(person => { return person.name == name; });

      if(found_person){
        var result = confirm("A person with this name was found, use them?");
        if(result){
          return found_person;
        }
      }
    }
    
    if(!Person.all){
      Person.all = [this];
    }else{
      Person.all.push(this);
    }
    
    this.name = name ? name : prompt(`Person's name: `, `Gwendolyn Smettenberg`);
    this.picture = picture ? picture : prompt(`Person's picture: `, `img/person.png`);
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
  
  var Group = function(name, picture){  
    if(Group.all){
      var found_group = Group.all.find(group => {return group.name === name});
      
      if(found_group){
        if(confirm("A group with this name was found, use it?")){
          return found_graph;
        }
      }
    }
    
    this.name = name ? name : prompt(`Group's name: `, `Gwendolyn's Knitting Circle`);
    this.picture = picture ? picture : prompt(`Picture of Gwendolyn's Knitting Circle: `, 'img/group.jpg');
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
      
      $(this).addClass('fourd');
      $(this).addClass('social-cartography');
      
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
          
          return;
        },
        items: {
          'add_person': {name: "Add Person"},
          'add_group': {name: 'Add Group'},
          'add_role': {name: 'Add Role', disabled: () => { return fourd.selected && !fourd.selected.entity; }},
          'remove': {name: 'Remove selected', disabled: () => {return !fourd.selected;}}
        }
      });

      var on_mousedown = function(event){
        fourd.selected = fourd.resolve_click(event);
      };
      
      return this;
    },
    
    add_person: function(){
      person = new Person();
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

      return person;
    },
    
    remove_person: function(){},
    
    add_group: function(){
      group = new Group();
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
      
      return group;
    },
    
    remove_group: function(){},
    
    add_role: function(){
      
      var person_name = prompt("Person's name?");
      var person = Person.all.find(person => person.name.match(person_name));
      if(!person){
        person = new Person(person_name);
      }

      var group_name = prompt("Group name?");
      var group = Group.all.find(group => group.name.match(group_name));
      if(!group){
        group = new Group(group_name);
      }

      
      var role = new Role(person, group);
      return role;
    },
    
    remove_role: function(){},
    
    _destroy: function(){
      $(this).removeClass('social-cartogrraphy');
    }
  });
}(jQuery));