/*
  jquery.social-cartography.js

  Joshua Marshall Moore
  May 11th, 2018
  Monmouth, Oregon, United States

  August 4th, 2018
  North Las Vegas, Nevada, United States
*/

(function($){

  var fourd = null;
  var selected = null;
  
  persons = []; // do you think we'll get released? 
  groups = []; // i don't know, what do you think it's like?
  roles = []; // i hope it doesn't hurt... history, do you know?

  var history = []; // nah, no clue yet
  var future = [];
  
  history.undo = function(){
    var event = this.pop();

    var undos = {
      'add_person': 'remove_person',
      'add_group': 'remove_group',
      'add_role': 'remove_role'
    };

    if(event){
      $('#display').social_cartography(undos[event.command], event.id);
      future.unshift(event.command, event.info);
    }else{
      console.log('history empty.')
    }
  }

  future.redo = function(){
    var event = this.shift();
    if(event){
      $('#display').social_cartography(event.command, event.info);
    }
  }

  
  var role_id = 0;
  var Role = function(person, group){
    this.id = role_id++;
    this.type = "Role";
    
    if(Role.all){
      Role.all.push(this);
    }else{
      Role.all = [this];
    }
    
    this.person = person;
    this.group = group;
    
    this.vertex = fourd.graph.add_vertex({
      cube: {size: 10, texture: 'img/role.png'}, 
      label: {offset: 50, text: person.name + '@' + group.name}
    });
    
    fourd.graph.add_edge(this.vertex, this.person.vertex);
    fourd.graph.add_edge(this.vertex, this.group.vertex);
  }
  Role.all = [];
  
  var person_id = 0;
  var Person = function(info){
    this.id = person_id++;
    this.type = "Person";
    
    if(!Person.all){
      Person.all = [this];
    }else{
      Person.all.push(this);
    }
    
    this.name = info.name;
    this.picture = info.picture;
    this.roles = new Set();
    
    return this;
  };
  Person.all = [];
  
  var group_id = 0;
  var Group = function(info){
    this.id = group_id++;
    this.type = "Group";
    
    this.name = info.name
    this.picture = info.picture;
    
    if(!Group.all){
      Group.all = [this];
    }else{
      Group.all.push(this);
    }
    
    this.roles = new Set();

    return this;
  };
  Group.all = [];
  
  $.widget('jmm.social_cartography', {
    options: {
      background: 0x004477,
      border: 0,
      width: window.innerwidth,
      height: window.innerHeight
    },
    
    _create: function(options){
      var settings = {};
      $.extend(settings, this.options, {
        display: 'block',
        margin: 0,
        padding: 0,
        border: 0,
        overflow: 'hidden',
        background: 0x004477,
        width: window.innerWidth,
        height: window.innerHeight
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
      
      $('#show-labels').change(function(){
        if($(this).is(':checked')){
          $('#labels-hidden').remove();
        }else{
          $('<style id="labels-hidden">.text-label { visibility: hidden; } </style>').appendTo('html > head');
        }
      })

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
        }
      };
      
      var on_dblclick = function(event){
        console.log(selected);
        fourd.select(selected);
      };
      
      $(this).addClass('fourd');
      $(this).addClass('social-cartography');
      
      $('#display').on('mousedown', on_mousedown);
      $('#info').accordion();

      var submit_person = function submit_person(){
        var info = {
          name: $('#person-name').val(),
          picture: 'img/person.png'
        };
        
        var person = $('#display').social_cartography('add_person', info);
        $('#person-name').val('');
      };

      $('#submit-person').click(submit_person);
      $('#person-name').on('keydown', (event) => {
        if(event.keyCode == 13) submit_person();
      })
      

      var submit_group = function(){
        var info = {
          name: $('#group-name').val(),
          picture: 'img/group.png'
        };
        
        var group = $('#display').social_cartography('add_group', info);
        $('#group-name').val('');
      };

      $('#submit-group').click(submit_group);
      $('#group-name').on('keydown', event => {
        if(event.keyCode == 13) submit_group();
      });


      $('#role-description').on('keydown', event => {
        if(event.keyCode == 13) {
          var input = $('#role-description').val();
          var at_i = input.indexOf('@');
          var person_name = input.substr(0, at_i);
          var group_name = input.substr(at_i + 1);

          console.log(person_name, group_name);

          try{
            person = Person.all.find(p => p.name === person_name);
            if(person === undefined){
              person = Group.all.find(p => p.name === person_name); // highly experimental
            }
          }catch(e){
            console.error(e);
          }

          if(person === undefined){
            person = $('#display').social_cartography('add_person', {name: person_name, picture: 'img/person.png'});
          }

          try{
            group = Group.all.find(g => g.name === group_name)
          }catch(e){
            console.error(e);
          }

          if(group === undefined){
            group = $('#display').social_cartography('add_group', {name: group_name, picture: 'img/group.png'});
          }

          var role = $('#display').social_cartography('add_role', {person: person, group: group});
          $('#role-description').val('');
        }
      
        if(event.keyCode == 90 && event.ctrlKey){
          history.undo();
        }

        if(event.keyCode == 89 && event.ctrlKey){
          future.redo();
        }
      });
      
      var role_person = null;
      var role_group = null;

      var submit_role = function(){
        $('#isplay').social_cartography('add_role', {person: prompt('Person'), group: prompt('Group')});
        $(this).val(null);
      };
      
      $('#submit-role').click(submit_role);
      $('#new-role>*').on('keypress', (event) => {
        if(event.keyCode == 13){
          submit_role();
        }

        return true;
      });
      
      return this;
    },
    
    add_person: function(info){
      person = new Person(info);
      person_vertex = fourd.graph.add_vertex({
        cube: {
          size: 10,
          texture: person.picture
        },
        label: {
          text: person.name,
          offset: 50
        }
      });
      
      person.vertex = person_vertex;
      person.vertex.entity = person;
      
      persons.push(person);
      
      person.info = info;
      history.push({command: 'add_person', info: person.info, id: person.id});

      return person;
    },
    
    remove_person: function(id){
      var index = -1;
      var person = Person.all.find(function(value, idx){
        if(value.id === id){
          index = idx;
          return true;
        }

        return false;
      });

      if(person){
        fourd.graph.remove_vertex(person.vertex);
        Person.all.splice(index, 1);
      }
    },
    
    add_group: function(info){
      group = new Group(info);
      group_vertex = fourd.graph.add_vertex({
        cube: {
          size: 10,
          texture: group.picture
        },
        label: {
          text: group.name,
          offset: 50
        }
      });

      group.vertex = group_vertex;
      group.vertex.entity = group;
      
      groups.push(group);

      group.info = info;
      history.push({command: 'add_group', info: group.info, id: group.id});
      
      return group;
    },
    
    remove_group: function(id){
      var index = -1;
      var group = Group.all.find(function(value, idx){
        if(value.id === id){
          index = idx;
          return true;
        }

        return false;
      });

      if(group){
        fourd.graph.remove_vertex(group.vertex);
        Group.all.splice(index, 1);
      }
    },
    
    add_role: function(info){
      var person = info.person;
      var group = info.group;

      if(typeof person == 'string'){
        var person_name = person;
        try{
          if(!Person.all) throw 'error';
          person = Person.all.find(p => p.name == person);
        }catch(e){
          console.error(e);
        }
        if(person == undefined){
          person = $('#display').social_cartography('add_person', {name: person_name, picture: 'img/person.png'});
        }
      }

      if(typeof group == 'string'){
        var group_name = group;
        try{
          if(!Group.all) throw 'error';
          group = Group.all.find(g => g.name == group);
        }catch(e){
          console.error(e);
        }
        if(group == undefined ){
          group = $('#display').social_cartography('add_group', {name: group_name, picture: 'img/group.png'});
        }
      }
      console.log(person, group);

      var role = new Role(person, group);
      roles.push(role);

      // history
      role.info = {person: person, group: group};
      history.push({command: 'add_role', info: role.info, id: role.id});
      return role;
    },
    
    remove_role: function(id){
      var index = -1;
      var role = Role.all.find(function(val, idx){
        if(val.id === id){
          index = idx;
          return true;
        }

        return false;
      });
      fourd.graph.remove_vertex(role.vertex);
      Role.all.splice(index, 1);

      return true;
    },
    
    // not sure what to do here...
    clear: function(){
      fourd.graph.clear();
      Person.all = [];
      Group.all = [];
      Role.all = [];
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
            offset: 50,
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
          var group = $('#display').social_cartography('add_group', {
            name: input.groups[i].name, 
            picture: input.groups[i].picture
          });
          imported_groups.set(input.groups[i].id, group);
        }
        
        var imported_persons = new Map();
        for(var i in input.persons){
          var person = $('#display').social_cartography('add_person', {
            name: input.persons[i].name, 
            picture: input.persons[i].picture
          });
          imported_persons.set(input.persons[i].id, person);
        }
        
        for(var i in input.roles){
          var role = $('#display').social_cartography('add_role', {person: imported_persons.get(input.roles[i].person_id), group: imported_groups.get(input.roles[i].group_id)}); 
        }
      }
    },
    
    _destroy: function(){
      $(this).removeClass('social-cartogrraphy');
    },
    
    select: function(entity){
      // this is where code can go for doing something when a vertex is clicked, i think. 
    }
  });
}(jQuery));
