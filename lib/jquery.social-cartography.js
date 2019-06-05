/*
  jquery.social-cartography.js

  Joshua Marshall Moore
  May 11th, 2018
  Monmouth, Oregon, United States

  August 4th, 2018
  North Las Vegas, Nevada, United States

  October 26th, 2018
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
      console.log('history empty.');
    }
  }

  future.redo = function(){
    var event = this.shift();
    if(event){
      $('#display').social_cartography(event.command, event.info);
    }
  }

  var Entity = function(){

  }
  Entity.id = 0;
  Entity.all = [];
  
  var role_id = 0;
  var Role = function(info){
    this.id = Entity.id++;
    this.type = "Role";
    
    if(Role.all){
      Role.all.push(this);
    }else{
      Role.all = [this];
    }
    
    switch(typeof info.person){
      case 'number':
        this.person = Entity.all.find(p => p.id == info.person);
        break;
      case 'string':
        this.person = Entity.all.find(p => p.name == info.person);
        break;
      case 'object':
        this.person = info.person;
        break;
    }

    switch(typeof info.group){
      case 'number':
        this.group = Entity.all.find(e => e.id == info.group);
        break;
      case 'string':
        this.group = Entity.all.find(e => e.name == info.group);
        break;
      case 'object':
        this.group = info.group;
        break;
    }

    this.name = `${this.person.name}@${this.group.name}`;
    this.from = new Date(info.from);
    this.until = new Date(info.until);
    this.texture = info.texture;

    this.vertex = fourd.graph.add_vertex({
      cube: {size: 10, texture: info.texture}, 
      label: {offset: 10, text: this.name}
    });

    this.vertex.entity = this;
    
    fourd.graph.add_edge(this.vertex, this.person.vertex, {directed: true});
    fourd.graph.add_edge(this.group.vertex, this.vertex, {directed: true});

    return this;
  }
  Role.all = [];

  Role.prototype.toJSON = function(){
    return {
      id: this.id,
      person: this.person.id,
      group: this.group.id,
      name: this.name,
      from: this.from.to_normal(),
      until: this.until.to_normal(),
      texture: this.texture
    };
  };

  Role.prototype.set = function(options){
    this.name = options.name !== undefined ? options.name : this.name;
    
    this.from = options.from !== undefined ? new Date(options.from) : this.from;
    this.until = options.until !== undefined ? new Date(options.until) : this.until;
    this.vertex.set(options);
    if(this.vertex.label){
      this.vertex.label.element.innerHTML = this.name;
    }
  };
  
  var person_id = 0;
  var Person = function(info){
    this.options = info;
    this.id = Entity.id++;
    this.type = "Person";
    
    if(!Person.all){
      Person.all = [this];
    }else{
      Person.all.push(this);
    }
    Entity.all.push(this);
    
    this.name = info.name;
    this.texture = info.texture;
    this.from = new Date(info.from);
    this.until = new Date(info.until);

    this.vertex = fourd.graph.add_vertex({
      cube: {
        size: 10,
        texture: info.texture
      },
      label: {
        text: info.name,
        offset: 10
      }
    });
    this.vertex.entity = this;

    this.roles = new Set();
    
    return this;
  };
  Person.all = [];

  Date.prototype.to_normal = function(){
    return this.valueOf() ? `${this.getFullYear()}-${this.getMonth()+1}-${this.getDate()+1}` : null;
  }
  
  Person.prototype.toJSON = function(){
    return {
      id: this.id,
      name: this.name,
      from: this.from.to_normal(),
      until: this.until.to_normal(),
      texture: this.texture
    };
  };

  Person.prototype.set = function(options){
    this.name = options.name !== undefined ? options.name : this.name;
    if(this.vertex.label){
      this.vertex.label.element.innerHTML = options.name !== undefined ? options.name : this.name;
    }
    this.from = options.from !== undefined ? new Date(options.from) : this.from;
    this.until = options.until !== undefined ? new Date(options.until) : this.until;
    this.vertex.set(options);
  };

  var group_id = 0;
  var Group = function(info){
    this.options = info;
    this.id = Entity.id++;
    this.type = "Group";
    
    this.name = info.name
    this.texture = info.texture;
    this.from = new Date(info.from);
    this.until = new Date(info.until);

    if(!Group.all){
      Group.all = [this];
    }else{
      Group.all.push(this);
    }
    Entity.all.push(this)
    
    this.roles = new Set();

    this.vertex = fourd.graph.add_vertex({
      cube: {
        size: 10,
        texture: info.texture
      },
      label: {
        text: info.name,
        offset: 10
      }
    });
    this.vertex.entity = this;

    return this;
  };
  Group.all = [];

  Group.prototype.toJSON = function(){
    return {
      id: this.id,
      name: this.name,
      from: this.from.to_normal(),
      until: this.until.to_normal(),
      texture: this.texture
    };
  };

  Group.prototype.set = function(options){
    this.name = options.name !== undefined ? options.name : this.name;
    if(this.vertex.label){
      this.vertex.label.element.innerHTML = this.name;
    }
    this.from = options.from !== undefined ? new Date(options.from) : this.from;
    this.until = options.until !== undefined ? new Date(options.until) : this.until;
    this.vertex.set(options);
  };
  
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
          $(`
            <style id="labels-hidden">
              .text-label { visibility: hidden; } 
            </style>`
          ).appendTo('html > head');
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
      };
      
      var on_dblclick = function(event){
        console.log(selected);
        fourd.select(selected);
      };
      
      $(this).addClass('fourd');
      $(this).addClass('social-cartography');
      
      // $('#display').on('mousedown', on_mousedown);
      $('#info').accordion();

      var submit_person = function submit_person(){
        var info = {
          name: $('#person-name').val(),
          texture: 'img/person.png'
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
          texture: 'img/group.png'
        };
        
        var group = $('#display').social_cartography('add_group', info);
        $('#group-name').val('');
      };

      $('#submit-group').click(submit_group);
      $('#group-name').on('keydown', event => {
        if(event.keyCode == 13) submit_group();
      });

      var that = this;
      $('#role-description').on('keydown', event => {
        if(event.keyCode == 13) {
          var input = $('#role-description').val();
          var parts = input.split('@');
          var sub_name = parts[0];
          var super_name = parts[1];

          var sub_component, super_component;

          // search persons, then groups
          try{
            sub_component = Person.all.find(p => p.name == sub_name);
            if(sub_component === undefined){
              sub_component = Group.all.find(p => p.name == sub_name);
            }
          }catch(e){
            console.error(e);
          }

          if(!sub_component){
            sub_component = that.add_person({name: sub_name, texture: 'img/person.png'});
          }

          try{
            super_component = Group.all.find(g => g.name === super_name);
            if(!super_component){
              super_component = Person.all.find(g => g.name === super_name);
            }
            if(!super_component && super_name){
              super_component = that.add_group({name: super_name, texture: 'img/group.png'});
            }
          }catch(e){
            console.error(e);
          }

          
          console.assert(sub_component, "After all this work, no sub component");
          console.assert(super_component, "After all this work, no super component")
          var role = that.add_role({'person': sub_component, 'group': super_component, texture: 'img/role.png'});
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
        $('#display').social_cartography('add_role', {person: prompt('Person'), group: prompt('Group')});
        $(this).val(null);
      };
        
      // set up draggable area
      var dropArea = document.querySelector('#body');

      var dragOverHandler = (ev) => {
        console.log('File(s) in drop zone'); 
      
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
      }

      document.addEventListener('dragover', dragOverHandler, false);

      var removeDragData = (ev) => {
        console.log('Removing drag data');
      
        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to remove the drag data
          ev.dataTransfer.items.clear();
        } else {
          // Use DataTransfer interface to remove the drag data
          ev.dataTransfer.clearData();
        }
      };

      var dropHandler = (ev) => {
        console.log('File(s) dropped');
      
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
      
        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
              var file = ev.dataTransfer.items[i].getAsFile();
              console.log('... file[' + i + '].name = ' + file.name);

              this.import(file);
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
          }
        } 
        
        // Pass event to removeDragData for cleanup
        removeDragData(ev)
      };

      document.addEventListener('drop', dropHandler, false);
      var that = this;
      $(document).on('click', '.text-label', function(event){
        that.edit(event.target.vertex);
      });

      return this;
    },

    edit: function(vertex){
      this.editing_vertex = vertex;
      var entity = vertex.entity;
      $('#edit-entity-form').inputValues(entity.toJSON());
      
      var edit_vertex = document.querySelector('#edit-vertex');
      edit_vertex.showModal();
      $('#confirm-edit-vertex').one('click', () => {
        var edited_entity = $('#edit-entity-form').inputValues();
        vertex.label.element.text = edited_entity.name;
        console.log(edited_entity);
        this.editing_vertex.entity.set(edited_entity);
        this.editing_verex = null;

        if($('#edit-vertex-file').val()){
          var el = $('#edit-vertex-file').get(0);
          var reader = new FileReader();
          reader.onload = function(event){
            vertex.set({texture: reader.result});
            vertex.entity.texture = reader.result;
          };
          reader.readAsDataURL(el.files[0])
          $(el).val(null)
        }
      });
    },
    
    add_person: function(info, id_callback){
      person = new Person(info);
      
      person.options = info;
      history.push({command: 'add_person', info: person.options, id: person.id});
      if(typeof id_callback == 'function') id_callback(person.id);

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
    
    add_group: function(info, id_callback){
      group = new Group(info);

      group.options = info;
      history.push({command: 'add_group', info: group.options, id: group.id});
      if(typeof id_callback == 'function') id_callback(group.id)
      
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
    
    add_role: function(info, id_callback){
      
      console.assert(info.person !== undefined, 'info.person must be defined');
      console.assert(info.group !== undefined, 'info.group must be defined');
      console.log(info)
      switch(typeof info.person){
        case 'number':
          info.person = Entity.all.find(p => p.id == info.person);
          break;

        case 'string':
          info.person = Entity.all.find(p => p.name == info.person);
          break;

        case 'object':
          if(!info.person.vertex){
            info.person = this.add_person(info.person, id => {
              info.person.id = id;
              replaceInRoles(id);
            });
          }
          break;
      }

      switch(typeof info.group){
        case 'number':
          info.group = Entity.all.find(e => e.id == info.group);
          break;

        case 'string':
          info.group = Entity.all.find(g => g.name == info.group);
          break;

        case 'object':
          if(!info.group.vertex){
            info.group = this.add_group(info.group, id => {
              info.group.id = id
              replaceInRoles(id);
            });
          }
      }

      console.log(person, group);
      var role = new Role(info); // creates its own vertex, incosistent with Person and Group!!!
      if(typeof id_callback == 'function') id_callback(role.id);

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
      Entity.id = 0;
      fourd.graph.clear();
      Entity.all = [];
      Person.all = [];
      Group.all = [];
      Role.all = [];
      persons = [];
      groups = [];
      roles = [];
    },
    
    export: function(){
      var byId = (a, b) => a.id - b.id;
      var output = {
        persons: Person.all.sort(byId).map(person => person.toJSON()), 
        groups: Group.all.sort(byId).map(group => group.toJSON()), 
        roles: Role.all.sort(byId).map(role => role.toJSON())
      };

      var filename = prompt("Enter a filename: ", "graph.sc.json");
      download(JSON.stringify(output), filename);
    },
    
    import: function(file){
      var byId = (a, b) => a.id - b.id;
      var input;
      if(file){
        input = file;
      }else{
        input = document.getElementById('upload').files[0];
      }

      var reader = new FileReader();
      reader.readAsText(input);
      reader.onload = (e) => {
        input = reader.result;
        input = JSON.parse(input);
        
        var oldIds = new Map();

        var makeReplaceInRoles = (old_id) => (id) => {
          input.roles.forEach(role => {
            if(role.person == old_id){
              role.person = id;
            }
            if(role.group == old_id){
              role.group = id;
            }
          })
        };

        input.persons = input.persons.sort(byId);
        input.persons.forEach(p => p.type = 'person');
        input.persons.forEach(person => {
          var old_id = person.id;
          this.add_person(person, makeReplaceInRoles(old_id));
        });

        input.groups = input.groups.sort(byId);
        input.groups.forEach(g => g.type = 'group');
        input.groups.forEach(group => {
          var old_id = group.id;
          this.add_group(group, makeReplaceInRoles(old_id));
        });

        input.roles = input.roles.sort(byId);
        input.roles.forEach(r => r.type = 'role');
        input.roles.forEach(this.add_role);
      
        console.log('done importing entities.');
      }
    },
    
    _destroy: function(){
      $(this).removeClass('social-cartography');
    },
    
    select: function(entity, event){
      // this is where code can go for doing something when a vertex is clicked, i think. 
      console.log(entity, event);
    }
  });
}(jQuery));
